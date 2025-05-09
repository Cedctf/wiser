# How to Retrieve Card Details in Marqeta

This guide explains how to properly retrieve card details (PAN, CVV, expiry) from the Marqeta API.

## Important Marqeta Sandbox Considerations

1. **PCI Compliance Simulation**: Even in sandbox, Marqeta hides sensitive card data to simulate production PCI compliance
2. **One-Time Retrieval**: Sensitive card data is only retrievable once per request
3. **Separate Endpoints**: You must use dedicated endpoints to retrieve sensitive card data

## Step 1: Create a Virtual Card

Create a card with the correct configuration:

```javascript
// Example payload
const payload = {
  card_product_token: "your_card_product_token",
  user_token: "your_user_token",
  token: "your_card_token" // Optional but useful for identification
};

// POST /cards endpoint
fetch('https://sandbox-api.marqeta.com/v3/cards', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('your_app_token:your_access_token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

In the Marqeta sandbox, cards are created as `VIRTUAL_PAN` by default in the latest API version.

## Step 2: Retrieve the Full Card Number (PAN)

Immediately after creating the card, retrieve the full PAN:

```javascript
// GET /cards/{card_token}/showpan endpoint
fetch('https://sandbox-api.marqeta.com/v3/cards/your_card_token/showpan', {
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + btoa('your_app_token:your_access_token'),
    'Accept': 'application/json'
  }
});
```

This returns:
```json
{
  "pan": "1111112345678901",
  "expiration": "0525",
  "cvv_number": null
}
```

## Step 3: CVV Code

In the Marqeta sandbox:

1. The CVV is typically not available through the API
2. For sandbox testing, you can use:
   - "123" for Visa/Mastercard test cards
   - "999" for other test cards

Note: In production, your implementation may vary depending on your Marqeta account configuration.

## Full Example

Our testing confirmed:

1. ✅ We successfully retrieved a card number using `/cards/{token}/showpan`
2. ❌ The `/cards/{token}/pan` endpoint returned 404 errors
3. ❌ The `/cards/{token}/showcvv` endpoint returned 404 errors
4. ✅ Sandbox test cards have standard PAN formats (starting with "111111...")

## Testing Card Numbers

When testing with the retrieved card number:

1. **Card Number**: Use the full PAN from the `/showpan` endpoint
2. **Expiration**: Use the expiration returned (format: "MMYY")
3. **CVV**: Use "123" or "999" for sandbox testing
4. **AVS**: Any address information will typically pass in sandbox

## Security Notes

When implementing in production:
1. Never store sensitive card data in your own database
2. Use Marqeta's token-based system to stay out of PCI scope
3. Only retrieve sensitive data when absolutely necessary
4. Implement proper encryption for any data in transit 