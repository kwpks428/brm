'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, Volume2, AlertTriangle, Activity, 
  Target, Brain, Eye, TrendingDown as ArrowDown, TrendingUp as ArrowUp,
  Shield, Clock, Users, Lightbulb, Play, Pause, CheckCircle
} from 'lucide-react';

// Data interfaces
interface PriceData {
  time: string;
  price: number;
  volume: number;
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface MarketData {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

interface Alert {
  id: string;
  type: 'price' | 'order' | 'volume' | 'technical';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
}

interface TradingRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  confidence: number; // 1-10
  riskLevel: number; // 1-10
  reason: string;
  targetPrice?: number;
  stopLoss?: number;
}

interface MarketInsight {
  type: 'whale' | 'institution' | 'sentiment' | 'technical';
  title: string;
  description: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  importance: number; // 1-5
}

interface ValuationData {
  currentPrice: number;
  fairValue: number;
  status: 'undervalued' | 'overvalued' | 'fair';
  supportLevel: number;
  resistanceLevel: number;
}

// Mock data generators (fallback)
const generateMockPriceData = (): PriceData[] => {
  const data = [];
  let basePrice = 67234;
  const now = Date.now();
  
  for (let i = 100; i >= 0; i--) {
    const time = new Date(now - i * 60000); // Every minute
    basePrice += (Math.random() - 0.5) * 1000; // Random price movement
    data.push({
      time: time.toLocaleTimeString(),
      price: Math.round(basePrice),
      volume: Math.round(Math.random() * 100 + 10)
    });
  }
  return data;
};

const generateOrderBook = (): { bids: OrderBookEntry[], asks: OrderBookEntry[] } => {
  const basePrice = 67234;
  const bids = [];
  const asks = [];
  
  // Generate bids (buy orders) - decreasing price
  let total = 0;
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 5 + 0.1;
    total += size;
    bids.push({
      price: basePrice - (i + 1) * 10,
      size: Number(size.toFixed(3)),
      total: Number(total.toFixed(3))
    });
  }
  
  // Generate asks (sell orders) - increasing price
  total = 0;
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 5 + 0.1;
    total += size;
    asks.push({
      price: basePrice + (i + 1) * 10,
      size: Number(size.toFixed(3)),
      total: Number(total.toFixed(3))
    });
  }
  
  return { bids, asks };
};

export default function Dashboard() {
  const [priceData, setPriceData] = useState<PriceData[]>(generateMockPriceData());
  const [orderBook, setOrderBook] = useState(generateOrderBook());
  const [marketData, setMarketData] = useState<MarketData>({
    currentPrice: 67234,
    priceChange: 1567,
    priceChangePercent: 2.34,
    volume24h: 28456,
    high24h: 68120,
    low24h: 65890
  });
  
  // User-focused data
  const [recommendation] = useState<TradingRecommendation>({
    action: 'WAIT',
    confidence: 7,
    riskLevel: 6,
    reason: '價格接近阻力位，建議等待回調至支撐位再入場',
    targetPrice: 65800,
    stopLoss: 64500
  });
  
  const [valuation] = useState<ValuationData>({
    currentPrice: 67234,
    fairValue: 65800,
    status: 'overvalued',
    supportLevel: 66800,
    resistanceLevel: 68500
  });
  
  const [marketInsights] = useState<MarketInsight[]>([
    {
      type: 'whale',
      title: '鯨魚持續吸籌',
      description: '過去1小時大戶淨流入 2,340 BTC，顯示機構看好後市',
      impact: 'bullish',
      importance: 5
    },
    {
      type: 'institution',
      title: 'ETF大額申購',
      description: 'BlackRock ETF今日申購量創新高，可能推高價格',
      impact: 'bullish',
      importance: 4
    },
    {
      type: 'sentiment',
      title: '市場情緒謹慎',
      description: '恐慌指數35，市場情緒從極度恐慌轉為謹慎樂觀',
      impact: 'neutral',
      importance: 3
    }
  ]);
  
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'technical',
      severity: 'high',
      message: '即將突破關鍵阻力位 $68,500，建議關注',
      timestamp: new Date(Date.now() - 2 * 60000)
    },
    {
      id: '2', 
      type: 'order',
      severity: 'medium',
      message: '發現 580 BTC 大單掛在 $67,800，可能形成阻力',
      timestamp: new Date(Date.now() - 5 * 60000)
    }
  ]);

  // Voice announcement system - Male voice optimized
  const announceAlert = (message: string, severity: 'high' | 'medium' | 'low') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Get all available voices
      const voices = speechSynthesis.getVoices();
      
      // Find male voice with better detection
      const maleVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        
        // macOS male voices
        return name.includes('alex') ||           // Alex (US)
               name.includes('daniel') ||         // Daniel (UK) 
               name.includes('thomas') ||         // Thomas (FR)
               name.includes('jorge') ||          // Jorge (ES)
               name.includes('luca') ||           // Luca (IT)
               name.includes('yannick') ||        // Yannick (DE)
               name.includes('otoya') ||          // Otoya (JP)
               name.includes('tingting') ||       // Male Chinese
               (voice.name.includes('Male') && lang.includes('en')) ||
               (!voice.name.toLowerCase().includes('female') && 
                !name.includes('susan') && 
                !name.includes('victoria') && 
                !name.includes('samantha') &&
                !name.includes('karen') &&
                !name.includes('moira') &&
                voice.gender !== 'female');
      }) || voices.find(voice => !voice.name.toLowerCase().includes('female')) || voices[0];
      
      utterance.voice = maleVoice;
      
      // Professional male voice settings based on severity
      switch (severity) {
        case 'high':
          utterance.rate = 1.1;      // Slightly faster for urgency
          utterance.pitch = 0.8;     // Lower pitch for authority
          utterance.volume = 0.9;    // Louder for attention
          break;
        case 'medium':
          utterance.rate = 1.0;      // Normal speed
          utterance.pitch = 0.9;     // Professional tone
          utterance.volume = 0.8;    // Standard volume
          break;
        case 'low':
          utterance.rate = 0.9;      // Slower, calmer
          utterance.pitch = 0.95;    // Slightly warmer
          utterance.volume = 0.7;    // Softer volume
          break;
      }
      
      // Ensure we have voices loaded
      if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          const newVoices = speechSynthesis.getVoices();
          const newMaleVoice = newVoices.find(voice => {
            const name = voice.name.toLowerCase();
            return name.includes('alex') || name.includes('daniel') || 
                   name.includes('male') || !name.includes('female');
          }) || newVoices[0];
          
          utterance.voice = newMaleVoice;
          speechSynthesis.speak(utterance);
        };
      } else {
        console.log('Using voice:', maleVoice?.name || 'Default');
        speechSynthesis.speak(utterance);
      }
    }
  };

// Real-time updates from our API (fallback to mock on error)
useEffect(() => {
  let isMounted = true;

  async function fetchTicker() {
    try {
      const res = await fetch('/api/price');
      if (!res.ok) throw new Error('ticker');
      const data = await res.json();
      if (!isMounted) return;
      setMarketData(prev => ({
        ...prev,
        currentPrice: data.price,
        priceChange: data.change,
        priceChangePercent: data.changePercent,
        volume24h: data.volume24h,
        high24h: data.high24h,
        low24h: data.low24h,
      }));
      // Append simple point for chart
      setPriceData(prev => {
        const now = new Date();
        const next = prev.concat([{ time: now.toLocaleTimeString(), price: data.price, volume: data.volume24h }]);
        return next.slice(-100);
      });
    } catch {
      // ignore, UI will keep last values
    }
  }

  async function fetchOrderBook() {
    try {
      const res = await fetch('/api/orderbook?limit=20');
      if (!res.ok) throw new Error('orderbook');
      const data = await res.json();
      if (!isMounted) return;
      setOrderBook({ bids: data.bids, asks: data.asks });
    } catch {
      // ignore
    }
  }

  // initial
  fetchTicker();
  fetchOrderBook();

  const interval = setInterval(() => {
    fetchTicker();
    fetchOrderBook();
  }, 5000);

  return () => { isMounted = false; clearInterval(interval); };
}, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-4 h-4" />;
      case 'order': return <Target className="w-4 h-4" />;
      case 'volume': return <Volume2 className="w-4 h-4" />;
      case 'technical': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'SELL': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'HOLD': return 'text-blue-400 bg-blue-500/10 border-blue-500';
      case 'WAIT': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <ArrowUp className="w-6 h-6" />;
      case 'SELL': return <ArrowDown className="w-6 h-6" />;
      case 'HOLD': return <Pause className="w-6 h-6" />;
      case 'WAIT': return <Clock className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Header - Simplified */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="text-2xl font-bold">比特幣智能交易助手</h1>
        </div>
        <div className="text-2xl font-mono text-white">
          ${marketData.currentPrice.toLocaleString()}
          <span className={`text-lg ml-2 ${marketData.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ({marketData.priceChangePercent >= 0 ? '+' : ''}{marketData.priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Trading Recommendation - Hero Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="flex items-center gap-6">
            {/* Action Recommendation */}
            <div className={`flex items-center gap-4 px-6 py-4 rounded-lg border-2 ${getActionColor(recommendation.action)}`}>
              {getActionIcon(recommendation.action)}
              <div>
                <div className="text-2xl font-bold">{recommendation.action === 'WAIT' ? '觀望' : recommendation.action === 'BUY' ? '買入' : recommendation.action === 'SELL' ? '賣出' : '持有'}</div>
                <div className="text-sm opacity-75">交易建議</div>
              </div>
            </div>

            {/* Risk & Confidence */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{recommendation.confidence}/10</div>
                <div className="text-sm text-gray-400">信心指數</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${recommendation.riskLevel > 7 ? 'text-red-400' : recommendation.riskLevel > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {recommendation.riskLevel}/10
                </div>
                <div className="text-sm text-gray-400">風險指數</div>
              </div>
            </div>

            {/* Recommendation Reason */}
            <div className="flex-1">
              <div className="text-lg font-semibold mb-2">分析理由</div>
              <div className="text-gray-300">{recommendation.reason}</div>
              {recommendation.targetPrice && (
                <div className="mt-2 text-sm">
                  <span className="text-green-400">目標價: ${recommendation.targetPrice.toLocaleString()}</span>
                  {recommendation.stopLoss && (
                    <span className="text-red-400 ml-4">止損: ${recommendation.stopLoss.toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Valuation & Price Analysis */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold">價值分析</h2>
          </div>
          
          <div className="space-y-4">
            {/* Current vs Fair Value */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">當前價格</span>
                <span className="text-2xl font-mono">${valuation.currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">合理價值</span>
                <span className="text-lg font-mono text-blue-400">${valuation.fairValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">估值狀態</span>
                <span className={`font-semibold ${
                  valuation.status === 'overvalued' ? 'text-red-400' : 
                  valuation.status === 'undervalued' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {valuation.status === 'overvalued' ? '高估' : 
                   valuation.status === 'undervalued' ? '低估' : '合理'}
                </span>
              </div>
            </div>

            {/* Support & Resistance */}
            <div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">阻力位</span>
                <span className="text-red-400 font-mono">${valuation.resistanceLevel.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">支撐位</span>
                <span className="text-green-400 font-mono">${valuation.supportLevel.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">市場洞察</h2>
          </div>
          
          <div className="space-y-4">
            {marketInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.type === 'whale' && <Users className="w-4 h-4 text-purple-400" />}
                    {insight.type === 'institution' && <Shield className="w-4 h-4 text-blue-400" />}
                    {insight.type === 'sentiment' && <Activity className="w-4 h-4 text-green-400" />}
                    {insight.type === 'technical' && <TrendingUp className="w-4 h-4 text-orange-400" />}
                    <span className="font-semibold text-sm">{insight.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({length: insight.importance}).map((_, i) => (
                      <div key={i} className="w-1 h-4 bg-yellow-400 rounded"></div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                <div className={`text-xs font-semibold ${getImpactColor(insight.impact)}`}>
                  {insight.impact === 'bullish' ? '看多信號' : 
                   insight.impact === 'bearish' ? '看空信號' : '中性影響'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Chart - Simplified */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold">價格走勢</h2>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">24h 高</div>
              <div className="text-lg font-mono text-green-400">${marketData.high24h.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">24h 低</div>
              <div className="text-lg font-mono text-red-400">${marketData.low24h.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immediate Actions */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-semibold">立即行動</h3>
          </div>
          
          <div className="space-y-4">
            {/* Next Action Item */}
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-400">下一步行動</span>
              </div>
              <p className="text-white mb-3">等待價格回調至 $66,800 支撐位附近，然後考慮分批入場</p>
              <div className="text-sm text-blue-300">預估等待時間: 2-6 小時</div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-green-900/20 hover:bg-green-800/30 border border-green-500/30 rounded-lg transition-colors">
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-sm text-green-400">設定買入提醒</div>
                <div className="text-xs text-gray-400">@ $66,800</div>
              </button>
              
              <button className="p-3 bg-yellow-900/20 hover:bg-yellow-800/30 border border-yellow-500/30 rounded-lg transition-colors">
                <Shield className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <div className="text-sm text-yellow-400">設定止損</div>
                <div className="text-xs text-gray-400">@ $64,500</div>
              </button>
            </div>

            {/* Voice Announcements */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="p-3 bg-purple-900/20 hover:bg-purple-800/30 border border-purple-500/30 rounded-lg transition-colors flex flex-col items-center gap-1"
                onClick={() => {
                  const message = `市場快報：比特幣現價 ${marketData.currentPrice.toLocaleString()} 美元，當前交易建議觀望，風險指數 ${recommendation.riskLevel} 分，建議等待回調至支撐位再入場`;
                  announceAlert(message, 'medium');
                }}
              >
                <Volume2 className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-purple-400">播報分析</span>
              </button>
              
              <button 
                className="p-3 bg-blue-900/20 hover:bg-blue-800/30 border border-blue-500/30 rounded-lg transition-colors flex flex-col items-center gap-1"
                onClick={() => {
                  announceAlert('語音測試：比特幣智能交易助手運行正常，男性專業播報員為您服務', 'high');
                }}
              >
                <Play className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-blue-400">測試男聲</span>
              </button>
            </div>
          </div>
        </div>

        {/* Smart Alerts */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-semibold">智能預警</h3>
            </div>
            <div className="text-sm text-gray-400">{alerts.length} 個活動警報</div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border cursor-pointer hover:opacity-80 transition-all ${getSeverityColor(alert.severity)}`}
                onClick={() => announceAlert(alert.message, alert.severity)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getSeverityIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-70">
                        {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} 分鐘前
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                        {alert.severity === 'high' ? '高' : alert.severity === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Alert Summary */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">今日預警總数:</span>
              <span className="text-white">12 個</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">正確率:</span>
              <span className="text-green-400">87%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
