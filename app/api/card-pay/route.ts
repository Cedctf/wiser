import { NextResponse } from 'next/server';
import { depositSol } from '@/utils/Deposit';
import dotenv from 'dotenv';
dotenv.config();

export async function POST(request: Request) {
  try {
    const { amount, cardToken, walletPublicKey, walletInstance } = await request.json();

    if (!amount || !cardToken || !walletPublicKey) {
      return NextResponse.json(
        { error: 'Amount, card token, and wallet public key are required' },
        { status: 400 }
      );
    }

    // Step 1: Get SOL equivalent amount from Pyth API
    const pythResponse = await fetch(`${request.headers.get('origin')}/api/pyth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usdAmount: amount })
    });

    if (!pythResponse.ok) {
      const error = await pythResponse.json();
      return NextResponse.json(
        { error: `Failed to get SOL price: ${error.error}` },
        { status: pythResponse.status }
      );
    }

    const pythData = await pythResponse.json();
    const solAmount = pythData.solEquivalent;

    // Step 2: Deposit SOL to the vault
    let depositTxId;
    try {
      depositTxId = await depositSol(solAmount, walletInstance);
    } catch (error) {
      console.error('Error depositing SOL:', error);
      return NextResponse.json(
        { error: `Failed to deposit SOL: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Step 3: Process the card transaction with the USD amount
    const transactResponse = await fetch(`${request.headers.get('origin')}/api/transact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        cardToken: cardToken
      })
    });

    if (!transactResponse.ok) {
      const error = await transactResponse.json();
      return NextResponse.json(
        { error: `Failed to process card transaction: ${error.error}` },
        { status: transactResponse.status }
      );
    }

    const transactionData = await transactResponse.json();

    // Return combined response with all details
    return NextResponse.json({
      success: true,
      solAmount,
      usdAmount: amount,
      depositTransaction: {
        txId: depositTxId
      },
      cardTransaction: transactionData.transaction
    });

  } catch (error) {
    console.error('Error in card payment process:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
