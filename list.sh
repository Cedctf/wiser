#!/bin/bash

# === CONFIG ===
APP_TOKEN="get from env"
ACCESS_TOKEN="get from env"
BASE_URL="https://sandbox-api.marqeta.com/v3"
AUTH_HEADER=$(echo -n "$APP_TOKEN:$ACCESS_TOKEN" | base64)

echo "📋 Fetching all users..."
USERS=$(curl -s -X GET "$BASE_URL/users?count=1000" \
  -H "Authorization: Basic $AUTH_HEADER" \
  -H "Content-Type: application/json")

USER_TOKENS=$(echo "$USERS" | jq -r '.data[].token')

for USER_TOKEN in $USER_TOKENS; do
  echo "🔍 Processing user: $USER_TOKEN"

  CARDS=$(curl -s -X GET "$BASE_URL/cards/user/$USER_TOKEN" \
    -H "Authorization: Basic $AUTH_HEADER" \
    -H "Content-Type: application/json")

  CARD_TOKENS=$(echo "$CARDS" | jq -r '.data[].token')

  for CARD_TOKEN in $CARD_TOKENS; do
    echo "🗑️ Terminating card: $CARD_TOKEN"
    curl -s -X POST "$BASE_URL/cards/$CARD_TOKEN/transitions" \
      -H "Authorization: Basic $AUTH_HEADER" \
      -H "Content-Type: application/json" \
      -d '{
        "state": "TERMINATED",
        "channel": "API",
        "reason": "Auto bulk deletion"
      }' | jq '{token, state, response}'
  done
done

echo "✅ All cards terminated for all users."