export type Ticker = {
  symbol: string;
  price: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  change: number;
  changePercent: number;
};

export async function fetchBinanceTicker(symbol = "BTCUSDT"): Promise<Ticker> {
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`);
  const data = await res.json();
  return {
    symbol,
    price: Number(data.lastPrice),
    high24h: Number(data.highPrice),
    low24h: Number(data.lowPrice),
    volume24h: Number(data.volume),
    change: Number(data.priceChange),
    changePercent: Number(data.priceChangePercent),
  };
}

export type OrderBook = {
  bids: { price: number; size: number; total: number }[];
  asks: { price: number; size: number; total: number }[];
};

export async function fetchBinanceOrderBook(symbol = "BTCUSDT", limit = 50): Promise<OrderBook> {
  const url = `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Binance orderbook error: ${res.status}`);
  const data = await res.json();

  let total = 0;
  const bids = (data.bids as [string, string][])?.map(([p, q]) => {
    total += Number(q);
    return { price: Number(p), size: Number(q), total: Number(total.toFixed(3)) };
  }) || [];

  total = 0;
  const asks = (data.asks as [string, string][])?.map(([p, q]) => {
    total += Number(q);
    return { price: Number(p), size: Number(q), total: Number(total.toFixed(3)) };
  }) || [];

  return { bids, asks };
}