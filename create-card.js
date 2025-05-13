import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(`${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`).toString('base64');

// Use the cardholder token from the create-cardholder.js script
// You can pass this as a command line argument if needed
const CARDHOLDER_TOKEN = 'bbafc74d-e458-45ea-aea3-2a218bd0ccf8';

// Card product token obtained from the Marqeta API
const CARD_PRODUCT_TOKEN = '7c373289-71b9-4076-b431-e7389bf606e4';

/**
 * Creates a virtual card for a user in the Marqeta system
 * 
 * Required fields:
 * - card_product_token: Identifies the card product to use
 * - user_token: The cardholder user token
 * - token: Unique identifier for this card (optional but recommended)
 */
const payload = {
  card_product_token: CARD_PRODUCT_TOKEN,
  user_token: CARDHOLDER_TOKEN,
  token: `devcard_${Date.now()}`
};

console.log('Making API request to:', `${MARQETA_URL}/cards`);
console.log('Request payload:', JSON.stringify(payload, null, 2));

// Main function to create a card
async function createCard() {
  try {
    // Check if required environment variables are set
    if (!process.env.MARQETA_APP_TOKEN || !process.env.MARQETA_ACCESS_TOKEN) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    const res = await fetch(`${MARQETA_URL}/cards`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...res.headers]), null, 2));
    
    const data = await res.json();

    if (res.ok) {
      console.log('✅ Virtual card created:', data.token);
      console.log('✅ Full response:', JSON.stringify(data, null, 2));
      return data;
    } else {
      console.error('❌ Failed to create card:');
      console.error('Status:', res.status);
      console.error('Body:', JSON.stringify(data, null, 2));
      throw new Error(`API Error: ${data.error_code} - ${data.error_message}`);
    }
  } catch (error) {
    console.error('⚠️ Error making request:', error.message);
    process.exit(1);
  }
}

createCard();