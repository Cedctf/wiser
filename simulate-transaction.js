import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(
  `${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`
).toString('base64');

// Replace with your actual card token from the previous step
const CARD_TOKEN = 'devcard_1746819960107';

// Optional: Set to your webhook endpoint, username, and password if you want notifications
const WEBHOOK_ENDPOINT = ''; // e.g. 'https://your-webhook-url.com/'
const WEBHOOK_USERNAME = '';
const WEBHOOK_PASSWORD = '';

const payload = {
  amount: "10",
  card_token: CARD_TOKEN,
  card_acceptor: {
    mid: "123456890"
  },
  network: "VISA"
};

// Add webhook object if all fields are set
if (WEBHOOK_ENDPOINT && WEBHOOK_USERNAME && WEBHOOK_PASSWORD) {
  payload.webhook = {
    endpoint: WEBHOOK_ENDPOINT,
    username: WEBHOOK_USERNAME,
    password: WEBHOOK_PASSWORD
  };
}

async function simulateTransaction() {
  try {
    if (!process.env.MARQETA_APP_TOKEN || !process.env.MARQETA_ACCESS_TOKEN) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    if (!CARD_TOKEN) {
      throw new Error('Missing CARD_TOKEN. Please set it at the top of this file.');
    }

    console.log('Simulating transaction with payload:');
    console.log(JSON.stringify(payload, null, 2));

    const res = await fetch(`${MARQETA_URL}/simulations/cardtransactions/authorization`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      console.log('✅ Transaction simulated successfully!');
      console.log('Response:', JSON.stringify(data, null, 2));
      // Save the token from the response if needed
      if (data.token) {
        console.log('Transaction token:', data.token);
      }
    } else {
      console.error('❌ Failed to simulate transaction:');
      console.error('Status:', res.status);
      console.error('Body:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('⚠️ Error simulating transaction:', error.message);
    process.exit(1);
  }
}

// Run the simulation
simulateTransaction();