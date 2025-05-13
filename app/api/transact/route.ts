import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(
  `${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`
).toString('base64');

export async function POST(request: Request) {
  try {
    const { amount, cardToken } = await request.json();

    if (!amount || !cardToken) {
      return NextResponse.json(
        { error: 'Amount and card token are required' },
        { status: 400 }
      );
    }

    // Always use only the first 36 characters
    const trimmedCardToken = cardToken.substring(0, 36);

    const payload = {
      amount: amount.toString(),
      card_token: trimmedCardToken,
      card_acceptor: {
        mid: "123456890"
      },
      network: "VISA"
    };

    // Log payload for debugging
    console.log('Simulating transaction with payload:', payload);

    const res = await fetch(`${MARQETA_URL}/simulations/cardtransactions/authorization`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // Log response for debugging
    console.log('Marqeta response:', data);

    // Defensive: check for transaction object
    if (!res.ok || !data.transaction || !data.transaction.token) {
      return NextResponse.json(
        { error: `Failed to simulate transaction: ${data.error_message || JSON.stringify(data)}` },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        token: data.transaction.token,
        amount: data.transaction.amount,
        status: data.transaction.state,
        response: data.transaction.response
      }
    });

  } catch (error) {
    console.error('Error in transaction simulation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 