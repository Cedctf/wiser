# Marqeta API Integration

This project demonstrates how to integrate with the Marqeta API to create cardholders and cards.

## Setup

1. Create a `.env` file with your Marqeta API credentials:
```
MARQETA_APP_TOKEN=your_app_token
MARQETA_ACCESS_TOKEN=your_access_token
```

2. Install dependencies:
```
npm install
```

## Usage

### Create a Cardholder

To create a new cardholder:

```
node create-cardholder.js
```

This script will:
- Generate a unique email for the cardholder
- Create a user in the Marqeta system
- Return a `user_token` that can be used for card creation

### Create a Card

To create a new card for an existing cardholder:

1. Update the `CARDHOLDER_TOKEN` variable in `create-card.js` with the user token from the previous step
2. Run the script:

```
node create-card.js
```

This script will:
- Create a virtual card for the specified user
- Return details about the newly created card

### Create a Card with Explicit VIRTUAL_PAN Type

If you need to retrieve sensitive card details (PAN, CVV), create a card with:

```
node create-virtual-card.js
```

This script will:
- Create a virtual card with explicit `payment_instrument: "VIRTUAL_PAN"` setting
- Return the card token needed for retrieving sensitive data

### Get Card PAN (Card Number)

To retrieve the full card details:

1. Update the `CARD_TOKEN` variable in `get-card-pan.js` with your card token
2. Run the script:

```
node get-card-pan.js
```

This script will:
- Make a request to the `/cards/{token}/showpan` endpoint
- Return the full card number and expiration date

### Important Notes on Card Details

Based on our testing with the Marqeta sandbox API:

1. **PAN (Card Number)**: Can be retrieved using the `/cards/{token}/showpan` endpoint
2. **Expiration Date**: Returned with the PAN in the format "MMYY"
3. **CVV**: Not directly available through the API in sandbox; use "123" or "999" for testing
4. **One-Time Access**: Sensitive card data is only retrievable once per request

For a more comprehensive guide, see `MARQETA_CARD_DETAILS_GUIDE.md`.

## Troubleshooting

Common issues:
- `"Card product not found"`: Make sure you're using a valid card product token
- `"A card holder with the same email already exist"`: The script automatically generates unique emails
- `"Resource not found or unavailable"` when retrieving PAN/CVV: Make sure you're using the correct endpoint (`/cards/{token}/pan`) and that the card was created with `payment_instrument: "VIRTUAL_PAN"`
- API authentication errors: Check your environment variables are set correctly

## API Notes

- Cardholder creation uses the `/users` endpoint
- Card creation uses the `/cards` endpoint
- Card products can be listed using the `/cardproducts` endpoint
- Sensitive card data uses dedicated endpoints:
  - `/cards/{token}/pan` - Retrieves full PAN, expiry, and CVV 