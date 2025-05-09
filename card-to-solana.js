import fetch from 'node-fetch';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

dotenv.config();

const MARQETA_URL = 'https://sandbox-api.marqeta.com/v3';
const auth = 'Basic ' + Buffer.from(`${process.env.MARQETA_APP_TOKEN}:${process.env.MARQETA_ACCESS_TOKEN}`).toString('base64');

// Replace with your card token from create-card.js response
const CARD_TOKEN = 'devcard_1746819960107';

/**
 * Derives a Solana keypair from card data
 * The process:
 * 1. Get card PAN (Primary Account Number)
 * 2. Create a deterministic hash from the PAN
 * 3. Use the hash to generate a Solana keypair
 */
async function cardToSolanaWallet() {
  try {
    // Check if required environment variables are set
    if (!process.env.MARQETA_APP_TOKEN || !process.env.MARQETA_ACCESS_TOKEN) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    // Get the sensitive card data (PAN)
    console.log(`Getting card PAN for token: ${CARD_TOKEN}`);
    const panRes = await fetch(`${MARQETA_URL}/cards/${CARD_TOKEN}/showpan`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      }
    });
    
    if (!panRes.ok) {
      const errorData = await panRes.json();
      console.error('❌ Failed to retrieve card PAN:');
      console.error('Status:', panRes.status);
      console.error('Message:', errorData.error_message);
      throw new Error(`API Error: ${errorData.error_code} - ${errorData.error_message}`);
    }
    
    const panData = await panRes.json();
    const cardNumber = panData.pan;
    
    if (!cardNumber) {
      throw new Error('Could not retrieve card number');
    }
    
    // Display full card information similar to get-card-details.js
    console.log('\n✅ CARD NUMBER INFORMATION:');
    console.log('---------------------------');
    console.log('Full Card Number:', cardNumber);
    if (panData.expiration_month && panData.expiration_year) {
      console.log('Expiration (MM/YY):', `${panData.expiration_month}/${panData.expiration_year.toString().substr(-2)}`);
    }
    console.log('Last 4 digits:', cardNumber.slice(-4));
    
    // Generate deterministic seed from card number
    // Use SHA-256 to create 32 bytes of deterministic data from the card number
    console.log('\nGenerating Solana keypair from card number:', cardNumber);
    const seed = crypto.createHash('sha256').update(cardNumber).digest();
    console.log('SHA-256 hash created as seed (hex):', seed.toString('hex'));
    
    // Generate Solana keypair from the seed
    const keypair = nacl.sign.keyPair.fromSeed(seed);
    
    // Convert the keypair to the format used by Solana
    const publicKey = bs58.encode(keypair.publicKey);
    const secretKey = bs58.encode(keypair.secretKey);
    
    console.log('\n✅ SOLANA WALLET DERIVED FROM CARD:');
    console.log('----------------------------------');
    console.log('Public Key (address):', publicKey);
    console.log('Secret Key :', secretKey);
    console.log('\nNote: This Solana keypair is deterministically generated from your card number.');
    console.log('The same card number will always produce the same Solana wallet.');
    
    // You could save this keypair to a file or database
    // This is just logging the information for demo purposes
    
    return {
      card_token: CARD_TOKEN,
      card_number: cardNumber,
      last_four: panData.last_four || cardNumber.slice(-4),
      solana_public_key: publicKey,
      solana_secret_key: secretKey,
    };
  } catch (error) {
    console.error('⚠️ Error creating Solana wallet from card:', error.message);
    process.exit(1);
  }
}

// Execute the function
cardToSolanaWallet(); 