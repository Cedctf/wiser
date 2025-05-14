# Wiser

Wiser is a universal payment middleware that lets you pay wherever you are in fiat or crypto.

With Wiser you can:

- **Link your crypto wallet →** instantly generate a virtual debit card for everyday purchases.  
- **Enter your debit card info →** derive a deterministic on chain wallet keypair so you can tap into dApps without pre-funding.  

In both flows, Wiser routes the payment and charges a low transaction fee.

---

## 💡 Inspiration

Our team constantly juggle between fiat and crypto, and we saw two major pain points:

1. **Crypto enthusiasts** can’t swipe at most merchants without off-ramp hassles.  
2. **Card users** who want to buy on chain must learn wallets, seed phrases, and gas mechanics first.  

> “What if spending felt the same no matter which asset you hold and switching happened instantly behind the scenes?”  

That question sparked Wiser: the invisible layer unifying Visa rails and any blockchain.

---

## 🚧 The Problem

- **Liquidity Friction** – Crypto holders must cash out through third-party cards with high spreads.  
- **On-Ramp Complexity** – Fiat users struggle with wallet setup, private keys, and gas management.  
- **Merchant Risk** – Businesses worry about volatility and settlement delays when accepting crypto.

---

## 🔑 The Solution

- **Bi-Directional Flows**  
  - **Wallet → Card**: User sends crypto to Wiser; Wiser pays the merchant in fiat via Visa/Mastercard rails, debiting the user’s on-chain balance.  
  - **Card → Wallet**: User pays Wiser with their debit/credit card; Wiser pays the merchant in crypto on-chain, debiting the user’s card.   

---

## ⚙️ How Our Project Works

### A. Crypto → Fiat Flow (Create Card + Spend)

1. **Wallet Connect**  
   User connects their Web3 wallet via Phantom Wallet.  
2. **Create Virtual Card**  
   - Marqeta deterministically derives a virtual card number from the connected wallet address.  
   - Visa issues a linked virtual debit card.  
3. **Price Quote**  
   Wiser queries the Pyth Network oracle for the real-time crypto→USD rate.  
4. **Payment Initiation**  
   User sends the exact crypto amount + gas-fee to Wiser’s on-chain address.  
5. **Fiat Settlement**  
   Wiser settles the merchant in fiat via Visa/Mastercard rails, debiting the user’s on-chain balance.

---

### B. Fiat → Crypto Flow (Create Wallet + Spend)

1. **Card Entry**  
   User submits their debit/credit card details (PCI-tokenized by Visa).  
2. **Create On-Chain Wallet**  
   Marqeta uses the card token to derive a deterministic wallet keypair, encrypted client-side.  
3. **Price Quote**  
   Wiser fetches the live USD→crypto rate from the Pyth Network oracle.  
4. **On-Chain Transfer**  
   Users can send the transaction from derived wallet (even with zero balance) and covers the gas. After it succeeds, Wiser charges the linked card for the crypto amount plus a low     transaction fee

---
