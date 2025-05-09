import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';

// Basic authentication for Marqeta API
const auth = 'Basic ' + Buffer.from(
  `${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`
).toString('base64');

/**
 * Creates a cardholder user in the Marqeta system
 * 
 * Required fields:
 * - first_name: Cardholder's first name
 * - last_name: Cardholder's last name
 * - email: Unique email for the cardholder
 * - active: Whether the account is active
 */
const cardholderPayload = {
  first_name: 'Devnet',
  last_name: 'User',
  email: `devnet_${Date.now()}@example.com`,
  active: true
};

// Function to create a cardholder
async function createCardholder() {
  // Check if environment variables are set
  console.log('Environment variables:');
  console.log('MARQETA_APP_TOKEN:', process.env.MARQETA_APP_TOKEN ? 'Set (length: ' + process.env.MARQETA_APP_TOKEN.length + ')' : 'Not set');
  console.log('MARQETA_ACCESS_TOKEN:', process.env.MARQETA_ACCESS_TOKEN ? 'Set (length: ' + process.env.MARQETA_ACCESS_TOKEN.length + ')' : 'Not set');
  
  if (!process.env.MARQETA_APP_TOKEN || !process.env.MARQETA_ACCESS_TOKEN) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
  }

  console.log('API URL:', MARQETA_URL);
  console.log('Making API request to:', `${MARQETA_URL}/users`);
  console.log('Request payload:', JSON.stringify(cardholderPayload, null, 2));

  try {
    const res = await fetch(`${MARQETA_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardholderPayload)
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...res.headers]), null, 2));
    
    const data = await res.json();

    if (res.ok) {
      console.log('✅ Cardholder created:', data.token);
      return data;
    } else {
      console.error('❌ Failed to create cardholder:');
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
createCardholder();