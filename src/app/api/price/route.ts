import { NextResponse } from "next/server";
import { getFromRedis } from "@/lib/redis";
import { fetchBinanceTicker } from "@/lib/sources/binance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";

  try {
    // 優先從 Redis 讀取（Worker 更新的數據）
    const cached = await getFromRedis<any>('ticker:latest');
    if (cached) {
      return NextResponse.json({ source: "redis", ...cached }, { status: 200 });
    }

    // Fallback: 直接調用 Binance API
    const ticker = await fetchBinanceTicker(symbol);
    return NextResponse.json({ source: "binance_direct", ...ticker }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "ticker_error" }, { status: 502 });
  }
}
