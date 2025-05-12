import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const CARD_PRODUCT_TOKEN = '7c373289-71b9-4076-b431-e7389bf606e4';

const auth = 'Basic ' + Buffer.from(
  `${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`
).toString('base64');

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email } = await request.json();

    // Step 1: Create cardholder
    const cardholderPayload = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      active: true
    };
    
    const cardholderRes = await fetch(`${MARQETA_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardholderPayload)
    });

    if (!cardholderRes.ok) {
      const error = await cardholderRes.json();
      return NextResponse.json(
        { error: `Failed to create cardholder: ${error.error_message}` },
        { status: cardholderRes.status }
      );
    }

    const cardholderData = await cardholderRes.json();
    const cardholderToken = cardholderData.token;

    // Step 2: Create card
    const cardPayload = {
      card_product_token: CARD_PRODUCT_TOKEN,
      user_token: cardholderToken,
      token: `devcard_${Date.now()}`
    };

    const cardRes = await fetch(`${MARQETA_URL}/cards`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardPayload)
    });

    if (!cardRes.ok) {
      const error = await cardRes.json();
      return NextResponse.json(
        { error: `Failed to create card: ${error.error_message}` },
        { status: cardRes.status }
      );
    }

    const cardData = await cardRes.json();
    const cardToken = cardData.token;

    // Step 3: Get card details
    const cardDetailsRes = await fetch(`${MARQETA_URL}/cards/${cardToken}`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      }
    });

    if (!cardDetailsRes.ok) {
      const error = await cardDetailsRes.json();
      return NextResponse.json(
        { error: `Failed to get card details: ${error.error_message}` },
        { status: cardDetailsRes.status }
      );
    }

    const cardDetails = await cardDetailsRes.json();

    // Get PAN (card number)
    const panRes = await fetch(`${MARQETA_URL}/cards/${cardToken}/showpan`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      }
    });

    let panData = null;
    if (panRes.ok) {
      panData = await panRes.json();
    }

    return NextResponse.json({
      success: true,
      cardholder: {
        token: cardholderToken,
        firstName,
        lastName,
        email
      },
      card: {
        token: cardToken,
        lastFour: cardDetails.last_four,
        expiration: cardDetails.expiration,
        state: cardDetails.state,
        pan: panData?.pan || null,
        cvv: '999' // Hardcoded CVV as requested
      }
    });

  } catch (error) {
    console.error('Error in card creation process:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 