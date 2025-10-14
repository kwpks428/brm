# 🚀 BRM - Bitcoin Realtime Monitor

A professional-grade Bitcoin monitoring system with advanced technical analysis and real-time voice announcements.

## 🎯 Features

### 📊 Core Monitoring Capabilities
- **Real-time Price Tracking**: Multi-exchange price aggregation (Binance, Coinbase, Kraken)
- **Order Book Analysis**: Deep order book visualization with bid/ask monitoring
- **Technical Indicators**: RSI, MACD, Moving Averages, Bollinger Bands
- **Anomaly Detection**: Smart monitoring for unusual market behavior
- **Price Alerts**: Customizable alert system for price movements

### 🎙️ Voice Announcement System
- **Professional Male Voice**: Configurable voice settings for different alert types
- **Smart Scenarios**: Context-aware announcements based on market conditions
- **Multiple Alert Types**: Price movements, large orders, technical signals
- **Severity-based Tones**: Different voice characteristics for urgent vs normal alerts

### 📈 Advanced Analytics
- **Multi-exchange Price Comparison**: Real-time price differences monitoring
- **Order Book Imbalance Detection**: Identify market sentiment shifts
- **Volume Analysis**: Large order tracking and volume anomalies
- **Technical Pattern Recognition**: Automated support/resistance identification

## 🖥️ Interface Design

### Main Dashboard Layout:
```
┌─────────────────────────────────────────────────────────┐
│  🔴 BTC MONITOR    $67,234 (+2.34%)    [ALERTS: 3]     │
├─────────────────────────────────────────────────────────┤
│  ┌─ Price Chart (60%) ─┐  ┌─ Order Book (40%) ─────┐   │
│  │ TradingView Style   │  │ Real-time Depth       │   │
│  │ Technical Indicators│  │ Bid/Ask Analysis      │   │
│  └────────────────────┘  └───────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ ┌─Market─┐ ┌─Anomaly─┐ ┌─Technical─┐ ┌─Alerts──┐      │
│ │Overview│ │Detection│ │Indicators │ │Center   │      │
│ └────────┘ └─────────┘ └───────────┘ └─────────┘      │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Quick Start (Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Dashboard**:
   Open [http://localhost:3000](http://localhost:3000)

4. **Test Voice Announcements**:
   - Click on any alert in the Alert Center
   - Use the "測試男聲" button

### With Real-time Data (Requires Redis)

```bash
# Terminal 1: Start Redis (Docker)
docker run -d -p 6379:6379 redis:alpine

# Terminal 2: Start Worker
npm run worker:watch

# Terminal 3: Start Web
npm run dev
```

Worker will connect to Binance WebSocket and cache data in Redis.  
Frontend will fetch from `/api/price` and `/api/orderbook` every 5 seconds.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 + TypeScript + Tailwind CSS
- **Charts**: Recharts for real-time data visualization  
- **Icons**: Lucide React icons
- **Voice**: Web Speech Synthesis API

### Backend & Data
- **API Routes**: Next.js Serverless Functions
- **Real-time Worker**: Node.js + WebSocket (ws)
- **Cache**: Redis (ioredis)
- **Database**: PostgreSQL + Prisma ORM
- **Data Source**: Binance WebSocket Streams

### Deployment
- **Platform**: Railway (Zero-config deployment)
- **Architecture**: Multi-service (Web + Worker)
- **Monitoring**: Built-in health checks & logs

## 📱 Key Components

### Voice Announcement System
```typescript
const announceAlert = (message: string, severity: 'high' | 'medium' | 'low') => {
  // Male voice configuration with severity-based settings
  utterance.rate = severity === 'high' ? 1.1 : 1.0;
  utterance.pitch = severity === 'high' ? 0.9 : 0.95;
  utterance.volume = severity === 'high' ? 0.9 : 0.75;
}
```

### Real-time Data Updates
```typescript
// 5-second intervals for live market simulation
useEffect(() => {
  const interval = setInterval(() => {
    setOrderBook(generateOrderBook());
    setMarketData(prev => ({...prev, /* updates */}));
  }, 5000);
}, []);
```

## 🎨 Design Features

- **Dark Professional Theme**: Easy on eyes for long trading sessions
- **Color-coded Alerts**: Red (urgent), Yellow (medium), Blue (low)  
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Updates**: Live price and order book refresh
- **Interactive Elements**: Clickable alerts trigger voice announcements

## ✅ Real-time Data Integration (Completed!)

### Active Features:
- ✅ **Binance WebSocket Integration** - Real-time price, orderbook, trades
- ✅ **Redis Caching** - Sub-second data access
- ✅ **Dual-Service Architecture** - Separate web and worker processes
- ✅ **Auto-fallback** - Direct API calls if Redis unavailable
- ✅ **Health Monitoring** - `/api/health` endpoint for Railway

### Data Streams:
1. **Ticker Stream** - Price updates every ~1s
2. **OrderBook Stream** - 20-level depth, 100ms refresh
3. **Trade Stream** - Real-time trade feed
4. **Kline Stream** - 1-minute candlesticks

## 🔮 Future Enhancements

- [ ] PostgreSQL historical data storage
- [ ] Machine learning anomaly detection
- [ ] Advanced technical analysis (RSI, MACD, Bollinger Bands)
- [ ] Multi-cryptocurrency support (ETH, SOL, etc.)
- [ ] User alert customization
- [ ] WebSocket push to frontend (SSE/Socket.io)
- [ ] Trading signals & recommendations

## 📊 Data Architecture

### Real-time Flow
```
Binance → Worker (WebSocket) → Redis Cache → Next.js API → Frontend
```

### Fallback Mode
If Worker is offline, APIs directly fetch from Binance REST API.

### Redis Keys
- `ticker:latest` - Current BTC price & 24h stats (60s TTL)
- `orderbook:latest` - 20-level order book (60s TTL)  
- `trades:recent` - Last 100 trades
- `klines:1m` - Last 100 one-minute candles
- `worker:stats` - Worker health metrics

### API Endpoints
- `GET /api/price` - Current ticker (from Redis or Binance)
- `GET /api/orderbook?limit=20` - Order book depth
- `GET /api/health` - Service health check

---

**Built for Railway Platform** - Optimized for cloud deployment with auto-scaling capabilities.
