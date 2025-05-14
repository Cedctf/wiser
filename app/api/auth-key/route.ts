import { NextResponse } from 'next/server';

export async function GET() {
  // In a real app, you would add authentication here to ensure only authorized clients can get the key
  // This is a simplified example for demonstration purposes
  
  try {
    // Get the private key from the environment variable
    const privateKey = process.env.SOLANA_AUTHORITY_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Private key not configured' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ key: privateKey });
  } catch (error) {
    console.error('Error in auth-key endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get authority key' },
      { status: 500 }
    );
  }
} 