import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export async function POST(request: NextRequest) {
  try {
    const { cardNumber } = await request.json();

    // Validate input
    if (!cardNumber || cardNumber.length < 12) {
      return NextResponse.json(
        { error: 'Invalid card number provided' },
        { status: 400 }
      );
    }

    // Generate deterministic seed from card number
    const seed = crypto.createHash('sha256').update(cardNumber).digest();
    
    // Generate Solana keypair from the seed
    const keypair = nacl.sign.keyPair.fromSeed(seed);
    
    // Convert the keypair to the format used by Solana
    const publicKey = bs58.encode(keypair.publicKey);
    const secretKey = bs58.encode(keypair.secretKey);

    // Return only what's needed (avoid sending back the card number)
    return NextResponse.json({
      last_four: cardNumber.slice(-4),
      solana_public_key: publicKey,
      solana_secret_key: secretKey,
    });
  } catch (error) {
    console.error('Error converting card to Solana wallet:', error);
    return NextResponse.json(
      { error: 'Failed to process card number' },
      { status: 500 }
    );
  }
}