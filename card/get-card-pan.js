import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(`${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`).toString('base64');

// Replace with your card token from create-card.js response
const CARD_TOKEN = 'devcard_1746814323091';

/**
 * Retrieves sensitive card data using the correct /cards/{token}/pan endpoint
 * Note: PAN and CVV can only be retrieved once per request
 */
async function getCardPAN() {
  try {
    // Check if required environment variables are set
    if (!process.env.MARQETA_APP_TOKEN || !process.env.MARQETA_ACCESS_TOKEN) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    console.log(`Getting PAN information for card token: ${CARD_TOKEN}`);
    
    // Make a basic request to verify the card exists first
    const cardRes = await fetch(`${MARQETA_URL}/cards/${CARD_TOKEN}`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    });
    
    if (!cardRes.ok) {
      const cardData = await cardRes.json();
      console.error('❌ Card not found or not accessible:');
      console.error('Status:', cardRes.status);
      console.error('Message:', cardData.error_message || 'Unknown error');
      throw new Error(`API Error: ${cardData.error_code || cardRes.status} - ${cardData.error_message || 'Unknown error'}`);
    }
    
    const cardData = await cardRes.json();
    console.log('✅ Card verified:', cardData.token);
    console.log('✅ Instrument type:', cardData.instrument_type);
    
    // Now get the PAN data with the exact endpoint format from user's message
    console.log('\nRequesting PAN data...');
    const panRes = await fetch(`${MARQETA_URL}/cards/${CARD_TOKEN}/showpan`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    });
    
    const panData = await panRes.json();
    
    if (panRes.ok) {
      console.log('\n✅ CARD DETAILS RETRIEVED:');
      console.log('-------------------------');
      console.log('Card Number:', panData.card_number || panData.pan);
      console.log('Expiration:', panData.expiration);
      console.log('CVV Code:', panData.cvv_number);
      
      console.log('\n⚠️ IMPORTANT: This information is only retrievable once.');
      console.log('Store these details securely if needed for your integration.');
      
      return {
        card_number: panData.card_number || panData.pan,
        expiration: panData.expiration,
        cvv: panData.cvv_number
      };
    } else {
      console.error('❌ Failed to retrieve card details:');
      console.error('Status:', panRes.status);
      console.error('Message:', panData.error_message || 'Unknown error');
      
      if (panRes.status === 404) {
        console.log('\n⚠️ TROUBLESHOOTING:');
        console.log('1. Check if you have the correct permissions for retrieving sensitive card data');
        console.log('2. The API version might be different from what was expected');
        console.log('3. Try creating another card and using it immediately');
        
        // Provide alternative endpoint attempt suggestion
        console.log('\n🔍 For Marqeta sandbox, you could also try:');
        console.log('- GET /cards/{token}/showpan');
        console.log('- GET /cards/{token}/pantoken');
      }
      
      throw new Error(`API Error: ${panData.error_code || panRes.status} - ${panData.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('⚠️ Error retrieving card details:', error.message);
    process.exit(1);
  }
}

// Execute the function
getCardPAN(); 