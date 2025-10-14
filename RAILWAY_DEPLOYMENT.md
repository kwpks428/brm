# 🚀 Railway 部署指南

## 架構概覽

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway 專案: BRM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │  brm-web     │        │  brm-worker  │                  │
│  │  (Next.js)   │◄───────│  (WebSocket) │                  │
│  │  Frontend +  │        │  Data Sync   │                  │
│  │  API Routes  │        └──────┬───────┘                  │
│  └──────┬───────┘               │                           │
│         │                       │                           │
│         └───────────┬───────────┘                           │
│                     │                                        │
│            ┌────────▼────────┐                             │
│            │     Redis       │                             │
│            │  (即時數據快取)  │                             │
│            └─────────────────┘                             │
│                     │                                        │
│            ┌────────▼────────┐                             │
│            │   PostgreSQL    │                             │
│            │  (歷史數據存儲)  │                             │
│            └─────────────────┘                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 部署步驟

### 1. 準備 Railway 項目

1. 登錄 [Railway.app](https://railway.app)
2. 創建新項目或使用現有項目
3. 從 GitHub 連接此倉庫

### 2. 添加服務插件

#### 添加 Redis
```bash
# 在 Railway Dashboard 中：
1. 點擊 "New" → "Database" → "Add Redis"
2. Redis URL 會自動注入到環境變量 REDIS_URL
```

#### 添加 PostgreSQL
```bash
# 在 Railway Dashboard 中：
1. 點擊 "New" → "Database" → "Add PostgreSQL"  
2. DATABASE_URL 會自動注入到環境變量
```

### 3. 配置服務

Railway 會自動識別 `railway.toml` 並創建兩個服務：

#### Service 1: **brm-web** (前端 + API)
- **類型**: Web Service
- **啟動命令**: `npm run start`
- **健康檢查**: `/api/health`
- **自動域名**: Railway 會自動分配 `.up.railway.app` 域名

#### Service 2: **brm-worker** (實時數據同步)
- **類型**: Worker Service  
- **啟動命令**: `npm run worker`
- **功能**: WebSocket 訂閱 Binance 數據流並寫入 Redis

### 4. 環境變量

Railway 會自動注入以下變量：
- ✅ `REDIS_URL` - Redis 連接字符串
- ✅ `DATABASE_URL` - PostgreSQL 連接字符串
- ✅ `PORT` - Web 服務端口

可選自定義變量：
```env
SYMBOL=btcusdt          # 交易對 (預設: btcusdt)
NODE_ENV=production     # 環境
```

### 5. 部署

```bash
# 推送代碼到 GitHub
git add .
git commit -m "feat: add real-time data integration"
git push origin main

# Railway 會自動觸發部署
```

## 🔍 驗證部署

### 檢查 Web 服務
```bash
# 訪問你的 Railway 域名
curl https://your-app.up.railway.app/api/health

# 預期響應：
{"ok":true,"ts":1234567890,"service":"brm-web"}
```

### 檢查 Worker 日誌
在 Railway Dashboard 中查看 `brm-worker` 服務日誌，應該看到：
```
🚀 BRM Worker starting...
📊 Trading pair: BTCUSDT
🔴 Redis: redis://***@***:6379
🔌 Connecting to Binance WebSocket...
✅ WebSocket connected!
📊 Ticker: $67234.50 (+2.34%)
📖 OrderBook updated: spread $10.50 | bids: 20 | asks: 20
```

### 測試實時數據
```bash
# 測試價格 API
curl https://your-app.up.railway.app/api/price

# 預期響應：
{
  "source": "redis",
  "symbol": "BTCUSDT",
  "price": 67234.50,
  "changePercent": 2.34,
  ...
}

# 測試訂單簿 API
curl https://your-app.up.railway.app/api/orderbook

# 預期響應：
{
  "source": "redis",
  "bids": [...],
  "asks": [...],
  ...
}
```

## 📊 數據流說明

### Real-time Flow (實時數據流)

```
Binance WebSocket
      │
      ├─► Ticker Stream (1s 更新)
      ├─► OrderBook Stream (100ms 更新)
      ├─► Trade Stream (即時)
      └─► Kline Stream (1m K線)
      │
      ▼
  brm-worker
      │
      ├─► Redis Cache (60s TTL)
      │   ├─ ticker:latest
      │   ├─ orderbook:latest
      │   ├─ trades:recent (100筆)
      │   └─ klines:1m (100根)
      │
      └─► Redis Pub/Sub
          ├─ ticker:updates
          ├─ orderbook:updates
          └─ alerts
      │
      ▼
  Next.js API Routes
      │
      └─► Frontend (5s 輪詢)
```

### Historical Data Flow (歷史數據)

```
brm-worker
      │
      ├─► 完成的 K線
      ├─► 大單交易記錄
      └─► 價格警報
      │
      ▼
  PostgreSQL
      │
      ├─ price_history 表
      ├─ trades 表
      └─ alerts 表
      │
      ▼
  未來功能：
  - 技術指標計算
  - 歷史回測
  - 用戶警報設置
```

## 🎯 Railway 特有功能利用

### 1. **自動擴展**
Railway 會根據流量自動擴展 `brm-web` 服務

### 2. **零停機部署**
每次推送代碼，Railway 會：
1. 構建新版本
2. 運行健康檢查
3. 無縫切換流量

### 3. **即時日誌**
```bash
# 在 Railway Dashboard 查看實時日誌
- brm-web: 查看 API 請求和錯誤
- brm-worker: 查看 WebSocket 連接狀態和數據更新
```

### 4. **觀測指標**
Railway 提供：
- CPU 使用率
- 內存使用
- 網絡流量
- 請求延遲

### 5. **環境隔離**
```bash
# 可以創建多個環境
- production (主分支)
- staging (develop 分支)
- preview (PR 分支)
```

## 🔧 本地開發

### 啟動 Web 服務
```bash
npm run dev
```

### 啟動 Worker (需要本地 Redis)
```bash
# 方法1: 使用 Docker
docker run -d -p 6379:6379 redis:alpine

# 方法2: 連接 Railway Redis
export REDIS_URL="redis://default:xxx@xxx.railway.internal:6379"
npm run worker
```

### 同時運行
```bash
# Terminal 1
npm run dev

# Terminal 2  
npm run worker:watch
```

## 📈 監控與維護

### 檢查 Worker 健康狀態
```bash
# 在 Redis CLI 中查看統計
redis-cli GET worker:stats

# 輸出範例：
{
  "ticker": 1234,
  "orderbook": 5678,
  "trades": 890,
  "uptime": 3600,
  "connected": true
}
```

### 重啟服務
```bash
# 在 Railway Dashboard:
1. 進入對應服務
2. 點擊 "Restart"
```

### 擴展建議

#### 當用戶量增長時：
1. **添加 Redis 副本** - 讀寫分離
2. **使用 Pub/Sub** - 推送數據到前端 (WebSocket)
3. **添加 CDN** - 靜態資源加速
4. **數據庫優化** - 添加索引、分表

## 🚨 故障排除

### Worker 無法連接 WebSocket
```bash
# 檢查日誌中是否有錯誤
# 常見原因：
1. 網絡問題 - Railway 到 Binance 的連接
2. 速率限制 - Binance API 限制
3. Redis 連接失敗

# 解決方案：Worker 會自動重連（最多10次）
```

### API 返回空數據
```bash
# 可能原因：Worker 未運行或 Redis 數據過期
# 檢查：
1. Worker 日誌是否正常
2. Redis 中是否有數據: redis-cli GET ticker:latest
3. API 會自動 fallback 到直接調用 Binance
```

## 📝 下一步

- [ ] 添加 PostgreSQL Prisma schema
- [ ] 實現歷史數據存儲
- [ ] 添加用戶警報系統
- [ ] 實現 WebSocket 推送到前端
- [ ] 添加多幣種支持
- [ ] 技術指標計算（RSI, MACD）

---

**部署時間**: ~5 分鐘  
**成本**: Railway Hobby Plan ($5/月) 或 Pro Plan ($20/月)  
**支持**: 24/7 自動監控與告警
