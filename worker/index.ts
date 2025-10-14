#!/usr/bin/env node
/**
 * BRM Worker Service - Real-time Data Sync
 * 
 * This service runs on Railway as a separate worker process
 * Subscribes to Binance WebSocket streams and pushes data to Redis
 */

import WebSocket from 'ws';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SYMBOL = process.env.SYMBOL || 'btcusdt';

// Redis client for pub/sub
const redis = new Redis(REDIS_URL);
const redisPub = new Redis(REDIS_URL);

console.log('🚀 BRM Worker starting...');
console.log(`📊 Trading pair: ${SYMBOL.toUpperCase()}`);
console.log(`🔴 Redis: ${REDIS_URL.replace(/:[^:]*@/, ':***@')}`);

// Binance WebSocket streams
const streams = [
  `${SYMBOL}@ticker`,           // 實時價格
  `${SYMBOL}@depth20@100ms`,    // 訂單簿 (20檔位，100ms更新)
  `${SYMBOL}@trade`,            // 實時成交
  `${SYMBOL}@kline_1m`,         // 1分鐘K線
];

const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000;

// 統計數據
let stats = {
  ticker: 0,
  orderbook: 0,
  trades: 0,
  klines: 0,
  startTime: Date.now(),
};

function connect() {
  console.log('🔌 Connecting to Binance WebSocket...');
  
  ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    console.log('✅ WebSocket connected!');
    reconnectAttempts = 0;
    
    // 發送心跳
    setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ method: 'ping' }));
      }
    }, 30000);
  });

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (!message.data) return;
      
      const { stream, data: streamData } = message;

      // 處理不同的數據流
      if (stream.includes('@ticker')) {
        await handleTicker(streamData);
      } else if (stream.includes('@depth')) {
        await handleOrderBook(streamData);
      } else if (stream.includes('@trade')) {
        await handleTrade(streamData);
      } else if (stream.includes('@kline')) {
        await handleKline(streamData);
      }
    } catch (error) {
      console.error('❌ Message processing error:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket disconnected');
    reconnect();
  });
}

function reconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('💀 Max reconnection attempts reached. Exiting...');
    process.exit(1);
  }

  reconnectAttempts++;
  console.log(`🔄 Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  
  setTimeout(connect, RECONNECT_DELAY);
}

// 處理實時價格
async function handleTicker(data: any) {
  stats.ticker++;
  
  const ticker = {
    symbol: data.s,
    price: Number(data.c),
    high24h: Number(data.h),
    low24h: Number(data.l),
    volume24h: Number(data.v),
    change: Number(data.p),
    changePercent: Number(data.P),
    timestamp: Date.now(),
  };

  // 存入 Redis (快取最新數據)
  await redis.setex('ticker:latest', 60, JSON.stringify(ticker));
  
  // 發佈到 pub/sub 頻道
  await redisPub.publish('ticker:updates', JSON.stringify(ticker));
  
  console.log(`📊 Ticker: $${ticker.price.toFixed(2)} (${ticker.changePercent >= 0 ? '+' : ''}${ticker.changePercent.toFixed(2)}%)`);
}

// 處理訂單簿
async function handleOrderBook(data: any) {
  stats.orderbook++;
  
  const orderbook = {
    symbol: data.s || SYMBOL.toUpperCase(),
    bids: data.bids?.slice(0, 20).map(([price, size]: [string, string]) => ({
      price: Number(price),
      size: Number(size),
    })) || [],
    asks: data.asks?.slice(0, 20).map(([price, size]: [string, string]) => ({
      price: Number(price),
      size: Number(size),
    })) || [],
    timestamp: Date.now(),
  };

  // 計算累計量
  let totalBids = 0;
  orderbook.bids = orderbook.bids.map(bid => {
    totalBids += bid.size;
    return { ...bid, total: Number(totalBids.toFixed(3)) };
  });

  let totalAsks = 0;
  orderbook.asks = orderbook.asks.map(ask => {
    totalAsks += ask.size;
    return { ...ask, total: Number(totalAsks.toFixed(3)) };
  });

  // 存入 Redis
  await redis.setex('orderbook:latest', 60, JSON.stringify(orderbook));
  
  // 發佈到 pub/sub
  await redisPub.publish('orderbook:updates', JSON.stringify(orderbook));
  
  // 只在訂單簿有明顯變化時輸出日誌（減少噪音）
  if (stats.orderbook % 50 === 0) {
    const spread = orderbook.asks[0]?.price - orderbook.bids[0]?.price;
    console.log(`📖 OrderBook updated: spread $${spread?.toFixed(2)} | bids: ${orderbook.bids.length} | asks: ${orderbook.asks.length}`);
  }
}

// 處理成交記錄
async function handleTrade(data: any) {
  stats.trades++;
  
  const trade = {
    symbol: data.s,
    price: Number(data.p),
    quantity: Number(data.q),
    time: data.T,
    isBuyerMaker: data.m,
    timestamp: Date.now(),
  };

  // 保存最近100筆成交到列表
  await redis.lpush('trades:recent', JSON.stringify(trade));
  await redis.ltrim('trades:recent', 0, 99);
  
  // 發佈大單警報 (> 1 BTC)
  if (trade.quantity > 1) {
    const alert = {
      type: 'large_trade',
      message: `大單成交: ${trade.quantity.toFixed(2)} BTC @ $${trade.price.toFixed(2)}`,
      severity: trade.quantity > 10 ? 'high' : 'medium',
      timestamp: Date.now(),
    };
    await redisPub.publish('alerts', JSON.stringify(alert));
    console.log(`🐋 Large trade: ${trade.quantity.toFixed(2)} BTC @ $${trade.price.toFixed(2)}`);
  }
}

// 處理K線數據
async function handleKline(data: any) {
  stats.klines++;
  
  const kline = data.k;
  if (!kline.x) return; // 只處理完成的K線
  
  const candlestick = {
    time: kline.t,
    open: Number(kline.o),
    high: Number(kline.h),
    low: Number(kline.l),
    close: Number(kline.c),
    volume: Number(kline.v),
  };

  // 保存到歷史K線列表 (最近100根)
  await redis.lpush('klines:1m', JSON.stringify(candlestick));
  await redis.ltrim('klines:1m', 0, 99);
  
  console.log(`📈 Kline completed: O:${candlestick.open} H:${candlestick.high} L:${candlestick.low} C:${candlestick.close}`);
}

// 健康檢查與統計
setInterval(() => {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  console.log('\n📊 Worker Stats:');
  console.log(`   Uptime: ${uptime}s`);
  console.log(`   Ticker updates: ${stats.ticker}`);
  console.log(`   OrderBook updates: ${stats.orderbook}`);
  console.log(`   Trades: ${stats.trades}`);
  console.log(`   Klines: ${stats.klines}`);
  console.log(`   WebSocket: ${ws?.readyState === WebSocket.OPEN ? '✅ Connected' : '❌ Disconnected'}\n`);
  
  // 將統計數據存入 Redis
  redis.setex('worker:stats', 60, JSON.stringify({
    ...stats,
    uptime,
    connected: ws?.readyState === WebSocket.OPEN,
  }));
}, 30000); // 每30秒

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  ws?.close();
  redis.quit();
  redisPub.quit();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Interrupted. Shutting down...');
  ws?.close();
  redis.quit();
  redisPub.quit();
  process.exit(0);
});

// 啟動
connect();
