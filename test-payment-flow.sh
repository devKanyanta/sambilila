#!/bin/bash
# Test script for Lenco payment verification flow
# Usage: ./test-payment-flow.sh <base_url> [plan_slug] [phone] [operator]

BASE_URL="${1:-http://localhost:3000}"
PLAN_SLUG="${2:-weekly}"
PHONE="${3:-+260976543210}"
OPERATOR="${4:-MTN}"
REFERENCE=""

echo "=========================================="
echo "Lenco Payment Verification Flow Test"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Plan: $PLAN_SLUG"
echo "Phone: $PHONE"
echo "Operator: $OPERATOR"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_result() {
  local status=$1
  local message=$2
  
  if [ $status -eq 0 ]; then
    echo -e "${GREEN}✓ $message${NC}"
  else
    echo -e "${RED}✗ $message${NC}"
  fi
}

# Test 1: Initiate Payment
echo -e "\n${YELLOW}Test 1: POST /api/subscriptions/lenco/initiate${NC}"
echo "Initiating payment..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/subscriptions/lenco/initiate" \
  -H "Content-Type: application/json" \
  -d "{
    \"planSlug\": \"$PLAN_SLUG\",
    \"phone\": \"$PHONE\",
    \"operator\": \"$OPERATOR\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  print_result 0 "Payment initiation successful (HTTP $HTTP_CODE)"
  echo "Response:"
  echo "$BODY" | jq '.'
  
  # Extract reference for next tests
  REFERENCE=$(echo "$BODY" | jq -r '.reference // empty')
  if [ -n "$REFERENCE" ]; then
    echo -e "${GREEN}Reference: $REFERENCE${NC}"
  fi
else
  print_result 1 "Payment initiation failed (HTTP $HTTP_CODE)"
  echo "Response:"
  echo "$BODY" | jq '.'
  exit 1
fi

# Test 2: Check subscription status is PAST_DUE
echo -e "\n${YELLOW}Test 2: Verify subscription status is PAST_DUE${NC}"
echo "Checking subscription status via /my endpoint..."

MY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/subscriptions/my" \
  -H "Content-Type: application/json")

SUBSCRIPTION_STATUS=$(echo "$MY_RESPONSE" | jq -r '.subscription.status // empty')

if [ "$SUBSCRIPTION_STATUS" = "PAST_DUE" ]; then
  print_result 0 "Subscription correctly in PAST_DUE status"
  echo "Subscription details:"
  echo "$MY_RESPONSE" | jq '.subscription'
else
  echo -e "${YELLOW}Note: Subscription status is $SUBSCRIPTION_STATUS (expected PAST_DUE before payment confirmation)${NC}"
fi

# Test 3: Manual Verification (if reference obtained)
if [ -n "$REFERENCE" ]; then
  echo -e "\n${YELLOW}Test 3: POST /api/subscriptions/lenco/verify${NC}"
  echo "Verifying payment status..."
  
  VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/subscriptions/lenco/verify" \
    -H "Content-Type: application/json" \
    -d "{
      \"reference\": \"$REFERENCE\"
    }")
  
  VERIFY_HTTP=$(echo "$VERIFY_RESPONSE" | tail -n1)
  VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')
  
  if [ "$VERIFY_HTTP" = "200" ]; then
    print_result 0 "Verification check successful (HTTP $VERIFY_HTTP)"
    echo "Response:"
    echo "$VERIFY_BODY" | jq '.'
    
    PAYMENT_STATUS=$(echo "$VERIFY_BODY" | jq -r '.paymentStatus // empty')
    echo -e "Payment Status: ${YELLOW}$PAYMENT_STATUS${NC} (waiting for Lenco webhook)"
  else
    print_result 1 "Verification failed (HTTP $VERIFY_HTTP)"
    echo "Response:"
    echo "$VERIFY_BODY" | jq '.'
  fi
  
  # Test 4: Simulate Lenco Webhook
  echo -e "\n${YELLOW}Test 4: POST /api/subscriptions/lenco/webhook (simulated)${NC}"
  echo "Simulating webhook from Lenco..."
  
  WEBHOOK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/subscriptions/lenco/webhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"reference\": \"$REFERENCE\",
      \"status\": \"completed\",
      \"transaction_id\": \"txn_12345\",
      \"amount\": 10,
      \"currency\": \"ZMW\"
    }")
  
  WEBHOOK_HTTP=$(echo "$WEBHOOK_RESPONSE" | tail -n1)
  WEBHOOK_BODY=$(echo "$WEBHOOK_RESPONSE" | sed '$d')
  
  if [ "$WEBHOOK_HTTP" = "200" ]; then
    print_result 0 "Webhook processed successfully (HTTP $WEBHOOK_HTTP)"
    echo "Response:"
    echo "$WEBHOOK_BODY" | jq '.'
  else
    print_result 1 "Webhook processing failed (HTTP $WEBHOOK_HTTP)"
    echo "Response:"
    echo "$WEBHOOK_BODY" | jq '.'
  fi
  
  # Test 5: Check subscription status is now ACTIVE
  echo -e "\n${YELLOW}Test 5: Verify subscription is now ACTIVE${NC}"
  echo "Checking final subscription status..."
  
  FINAL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/subscriptions/my" \
    -H "Content-Type: application/json")
  
  FINAL_STATUS=$(echo "$FINAL_RESPONSE" | jq -r '.subscription.status // empty')
  
  if [ "$FINAL_STATUS" = "ACTIVE" ]; then
    print_result 0 "Subscription successfully activated!"
    echo "Final subscription details:"
    echo "$FINAL_RESPONSE" | jq '.subscription | {id, status, plan, currentPeriodStart, currentPeriodEnd}'
  else
    echo -e "${YELLOW}Note: Subscription status is $FINAL_STATUS${NC}"
    echo "Details:"
    echo "$FINAL_RESPONSE" | jq '.subscription'
  fi
else
  echo -e "${RED}Reference not obtained from initiate response. Skipping verification tests.${NC}"
fi

echo -e "\n${YELLOW}=========================================="
echo "Test Complete"
echo "==========================================${NC}"
echo ""
echo "Summary:"
echo "1. Payment initiated successfully"
echo "2. Subscription should be in PAST_DUE state"
echo "3. Webhook would activate subscription on completion"
echo ""
echo "Next steps:"
echo "- Wait for Lenco webhook callback (if configured)"
echo "- Or use manual /verify endpoint to check payment status"
echo "- Subscription will transition to ACTIVE when payment confirms"
