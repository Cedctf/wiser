import crypto from 'crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import readline from 'readline';

// Prompt user for card number (PAN)
function promptForCardNumber() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter your card number (PAN): ', (cardNumber) => {
      rl.close();
      resolve(cardNumber.trim());
    });
  });
}

/**
 * Derives a Solana keypair from card data
 * The process:
 * 1. Get card PAN (Primary Account Number)
 * 2. Create a deterministic hash from the PAN
 * 3. Use the hash to generate a Solana keypair
 */
async function cardToSolanaWallet() {
  try {
    const cardNumber = await promptForCardNumber();

    if (!cardNumber || cardNumber.length < 12) {
      throw new Error('Invalid card number entered.');
    }

    // Display full card information
    console.log('\n✅ CARD NUMBER INFORMATION:');
    console.log('---------------------------');
    console.log('Full Card Number:', cardNumber);
    console.log('Last 4 digits:', cardNumber.slice(-4));

    // Generate deterministic seed from card number
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

    return {
      card_number: cardNumber,
      last_four: cardNumber.slice(-4),
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