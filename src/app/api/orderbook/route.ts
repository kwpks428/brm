import { NextResponse } from "next/server";
import { getFromRedis } from "@/src/lib/redis";
import { fetchBinanceOrderBook } from "@/src/lib/sources/binance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const limit = Number(searchParams.get("limit") || 50);

  try {
    // 優先從 Redis 讀取（Worker 更新的實時訂單簿）
    const cached = await getFromRedis<any>('orderbook:latest');
    if (cached) {
      return NextResponse.json({ source: "redis", ...cached }, { status: 200 });
    }

    // Fallback: 直接調用 Binance API
    const ob = await fetchBinanceOrderBook(symbol, limit);
    return NextResponse.json({ source: "binance_direct", symbol, ...ob }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "orderbook_error" }, { status: 502 });
  }
}
