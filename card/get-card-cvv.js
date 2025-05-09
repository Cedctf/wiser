import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(`${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`).toString('base64');

// Replace with your card token from create-virtual-card.js response
const CARD_TOKEN = 'devcard_1746814323091';

/**
 * Retrieves CVV for a virtual card
 */
async function getCardCVV() {
  try {
    // Check if required environment variables are set
    if (!process.env.MARQETA_APP_TOKEN || !process.env.MARQETA_ACCESS_TOKEN) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    console.log(`Getting CVV information for card token: ${CARD_TOKEN}`);
    
    // Try the dedicated CVV endpoint
    console.log('\nRequesting CVV data...');
    const cvvRes = await fetch(`${MARQETA_URL}/cards/${CARD_TOKEN}/showcvv`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    });
    
    const cvvData = await cvvRes.json();
    
    if (cvvRes.ok) {
      console.log('\n✅ CVV RETRIEVED:');
      console.log('----------------');
      console.log('CVV Code:', cvvData.cvv_number);
      
      return {
        cvv: cvvData.cvv_number
      };
    } else {
      console.error('❌ Failed to retrieve CVV:');
      console.error('Status:', cvvRes.status);
      console.error('Message:', cvvData.error_message || 'Unknown error');
      
      // Try an alternative approach - retrieve the full card data
      console.log('\n🔍 Trying alternative approach...');
      
      // In Marqeta sandbox, CVV might be a standard value
      console.log('\n⚠️ IMPORTANT NOTE:');
      console.log('In the Marqeta sandbox environment, the CVV is typically:');
      console.log('- "123" or "999" for test cards');
      console.log('- In production, you would use the actual returned CVV');
      
      throw new Error(`API Error: ${cvvData.error_code || cvvRes.status} - ${cvvData.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('⚠️ Error retrieving CVV details:', error.message);
    process.exit(1);
  }
}

// Execute the function
getCardCVV(); 