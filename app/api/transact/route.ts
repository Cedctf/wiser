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

    const trimmedCardToken = cardToken.substring(0, 36);

    const payload = {
      amount: amount.toString(),
      card_token: trimmedCardToken,
      card_acceptor: {
        mid: "123456890"
      },
      network: "VISA"
    };

    console.log('Simulating transaction with payload:', payload);

    // Step 1: Simulate authorization
    const authRes = await fetch(`${MARQETA_URL}/simulations/cardtransactions/authorization`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const authData = await authRes.json();
    console.log('Authorization response:', authData);

    if (!authRes.ok || !authData.transaction || !authData.transaction.token) {
      return NextResponse.json(
        { error: `Failed to simulate transaction: ${authData.error_message || JSON.stringify(authData)}` },
        { status: authRes.status }
      );
    }

    const transactionToken = authData.transaction.token;

    // Step 2: Simulate clearing
    const clearingPayload = {
      amount: amount.toString(),
      original_transaction_token: transactionToken
    };

    const clearingRes = await fetch(`${MARQETA_URL}/simulate/clearing`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clearingPayload)
    });

    const clearingData = await clearingRes.json();
    console.log('Clearing response:', clearingData);

    if (!clearingRes.ok) {
      return NextResponse.json(
        { error: `Clearing step failed: ${clearingData.error_message || JSON.stringify(clearingData)}` },
        { status: clearingRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        token: transactionToken,
        amount: authData.transaction.amount,
        status: authData.transaction.state,
        response: authData.transaction.response
      },
      clearing: {
        state: clearingData.state,
        amount: clearingData.amount,
        token: clearingData.token,
        approval_code: clearingData.approval_code
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