import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(`${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`).toString('base64');

// Replace with your card token from create-card.js response
const CARD_TOKEN = 'devcard_1746813546324';

/**
 * Retrieves sensitive card data including full PAN and expiry
 * Note: Some endpoints may require specific permissions in your Marqeta account
 */
async function getCardDetails() {
  try {
    // Check if required environment variables are set
    if (!process.env.MARQETA_APP_TOKEN || !process.env.MARQETA_ACCESS_TOKEN) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    // First get the card details to verify it exists
    console.log(`Getting card information for token: ${CARD_TOKEN}`);
    const cardRes = await fetch(`${MARQETA_URL}/cards/${CARD_TOKEN}`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      }
    });
    
    const cardData = await cardRes.json();
    
    if (!cardRes.ok) {
      console.error('❌ Failed to retrieve card:');
      console.error('Status:', cardRes.status);
      console.error('Body:', JSON.stringify(cardData, null, 2));
      throw new Error(`API Error: ${cardData.error_code} - ${cardData.error_message}`);
    }
    
    console.log('✅ Card found:', cardData.token);
    console.log('User token:', cardData.user_token);
    console.log('Last 4 digits:', cardData.last_four);
    console.log('Expiration:', cardData.expiration);
    console.log('Status:', cardData.state);
    
    // Now get the sensitive card data (PAN)
    console.log('\nRequesting sensitive card data...');
    const panRes = await fetch(`${MARQETA_URL}/cards/${CARD_TOKEN}/showpan`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      }
    });
    
    if (panRes.ok) {
      const panData = await panRes.json();
      console.log('\n✅ CARD NUMBER INFORMATION:');
      console.log('---------------------------');
      console.log('Full Card Number:', panData.pan);
      if (panData.expiration_month && panData.expiration_year) {
        console.log('Expiration (MM/YY):', `${panData.expiration_month}/${panData.expiration_year.toString().substr(-2)}`);
      }
    } else {
      const panData = await panRes.json();
      console.warn('⚠️ Could not retrieve full card number:');
      console.warn('Status:', panRes.status);
      console.warn('Message:', panData.error_message);
      console.log('\nNOTE: Access to sensitive card data may be restricted in your Marqeta account.');
      console.log('Please check your API permissions or contact Marqeta support.');
    }
    
    // Try to get CVV (security code) - This may not be available depending on permissions
    console.log('\nAttempting to retrieve CVV data...');
    try {
      const cvvRes = await fetch(`${MARQETA_URL}/cards/${CARD_TOKEN}/showcvv`, {
        method: 'GET',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json'
        }
      });
      
      if (cvvRes.ok) {
        const cvvData = await cvvRes.json();
        console.log('✅ CVV INFORMATION:');
        console.log('------------------');
        console.log('CVV Security Code:', cvvData.cvv_number);
      } else {
        const cvvData = await cvvRes.json();
        console.warn('⚠️ Could not retrieve CVV:');
        console.warn('Status:', cvvRes.status);
        console.warn('Message:', cvvData.error_message);
      }
    } catch (error) {
      console.warn('⚠️ Error accessing CVV endpoint:', error.message);
    }
    
    return {
      card_token: cardData.token,
      last_four: cardData.last_four,
      expiration: cardData.expiration,
      state: cardData.state
    };
  } catch (error) {
    console.error('⚠️ Error retrieving card details:', error.message);
    process.exit(1);
  }
}

// Execute the function
getCardDetails(); 