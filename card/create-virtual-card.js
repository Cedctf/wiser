import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(`${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`).toString('base64');

// Use the cardholder token from the create-cardholder.js script
// Replace with your most recent user token
const CARDHOLDER_TOKEN = '4fb183c4-c3a4-4e1d-abc1-af83be6af56f';

// Card product token obtained from the Marqeta API
const CARD_PRODUCT_TOKEN = '7c373289-71b9-4076-b431-e7389bf606e4';

/**
 * Creates a virtual card that will be retrievable via the PAN endpoint
 * Note: In newer versions of Marqeta API, VIRTUAL_PAN is the default for cards
 */
const payload = {
  card_product_token: CARD_PRODUCT_TOKEN,
  user_token: CARDHOLDER_TOKEN,
  token: `devcard_${Date.now()}`,
  // The fulfillment structure is different than expected
  // The payment_instrument field is not directly in fulfillment
  // Based on API error, we'll use the basic card creation
};

console.log('Making API request to:', `${MARQETA_URL}/cards`);
console.log('Request payload:', JSON.stringify(payload, null, 2));

// Main function to create a card
async function createVirtualCard() {
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
    
    const data = await res.json();

    if (res.ok) {
      console.log('✅ Virtual card created:', data.token);
      console.log('✅ Card token:', data.token);
      console.log('✅ Last four digits:', data.last_four);
      console.log('✅ Expiration:', data.expiration);
      console.log('✅ Instrument type:', data.instrument_type);
      
      console.log('\n🔍 NEXT STEPS:');
      console.log('To retrieve sensitive card data (PAN, CVV), run:');
      console.log(`node get-card-pan.js   # Update CARD_TOKEN in the script to: ${data.token}`);
      
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

// Execute the function
createVirtualCard(); 