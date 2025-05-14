import { NextResponse } from 'next/server';

// SOL/USD price feed ID
const SOL_USD_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

export async function POST(request: Request) {
  try {
    const { usdAmount } = await request.json();
    if (!usdAmount || isNaN(Number(usdAmount)) || Number(usdAmount) <= 0) {
      return NextResponse.json({ error: 'Invalid USD amount' }, { status: 400 });
    }

    const response = await fetch(`https://hermes.pyth.network/api/latest_price_feeds?ids[]=${SOL_USD_FEED_ID}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch price data' }, { status: 500 });
    }
    const data = await response.json();
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No price data found' }, { status: 500 });
    }
    const priceInfo = data[0].price;
    const solUsdPrice = Number(priceInfo.price) * 10 ** Number(priceInfo.expo);
    if (!solUsdPrice || solUsdPrice <= 0) {
      return NextResponse.json({ error: 'Invalid price data' }, { status: 500 });
    }
    const solEquivalent = Number(usdAmount) / solUsdPrice;
    return NextResponse.json({
      usdAmount: Number(usdAmount),
      solUsdPrice,
      solEquivalent
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}