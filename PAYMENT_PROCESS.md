# Payment Process Documentation

## Overview

This document describes the complete payment process flow for the Lenco Payment API. The API enables mobile money payments through various operators across multiple African countries.

## Prerequisites

- Node.js and npm installed
- Valid Lenco API key
- `.env` file with `LENCO_API_KEY` configured
- Server running on configured PORT (default: 5000)

## Payment Flow

```
Client
   |
   v
POST /api/payment/request
   |
   +---> Validate Authorization
   |
   +---> Extract Payment Details
   |        - amount
   |        - reference
   |        - phone
   |        - operator
   |        - country
   |        - bearer
   |
   +---> Call Lenco API (Mobile Money Endpoint)
   |
   +---> Return Transaction Response to Client
   |
   v
GET /api/payment/verify/:reference (Optional - For Status Check)
   |
   +---> Validate Authorization
   |
   +---> Query Lenco API for Payment Status
   |
   +---> Return Payment Status to Client
```

## Step 1: Send Payment Request

### Endpoint
```
POST /api/payment/request
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <LENCO_API_KEY>
```

### Request Body
```json
{
  "amount": 5000,
  "reference": "TXN123456789",
  "phone": "256701234567",
  "operator": "MTN",
  "country": "ZM",
  "bearer": "customer"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Payment amount in smallest currency unit (cents/lowest denomination) |
| `reference` | string | Yes | Unique transaction reference ID (must be unique per transaction) |
| `phone` | string | Yes | Customer phone number in international format (with country code) |
| `operator` | string | Yes | Mobile network operator (MTN, Airtel, Vodafone, etc.) |
| `country` | string | Yes | Country code (UG, KE, GH, TZ, etc.) |
| `bearer` | string | Yes | Who bears the transaction fee: `customer` or `merchant` |

### Example Request (cURL)
```bash
curl -X POST http://localhost:5000/api/payment/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx" \
  -d '{
    "amount": 5000,
    "reference": "TXN20260605001",
    "phone": "256701234567",
    "operator": "MTN",
    "country": "UG",
    "bearer": "customer"
  }'
```

### Successful Response (200 OK)
```json
{
  "success": true,
  "status": "pending",
  "reference": "TXN20260605001",
  "amount": 5000,
  "currency": "UGX",
  "timestamp": "2026-06-05T10:30:00Z",
  "transaction_id": "txn_abc123xyz"
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Missing authorization token. Provide Authorization header or LENCO_API_KEY in environment."
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid request parameters",
  "details": {
    "message": "Missing required field: phone"
  }
}
```

**500 Server Error:**
```json
{
  "error": "API Error",
  "details": {
    "message": "Service temporarily unavailable"
  }
}
```

## Step 2: Verify Payment Status (Optional)

### Endpoint
```
GET /api/payment/verify/:reference
```

### Headers
```
Authorization: Bearer <LENCO_API_KEY>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reference` | string | Yes | The unique transaction reference from the payment request |

### Example Request (cURL)
```bash
curl -X GET http://localhost:5000/api/payment/verify/TXN20260605001 \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx"
```

### Possible Response Statuses

```json
{
  "reference": "TXN20260605001",
  "status": "completed",
  "amount": 5000,
  "currency": "UGX",
  "phone": "256701234567",
  "operator": "MTN",
  "country": "UG",
  "timestamp": "2026-06-05T10:30:00Z",
  "completed_at": "2026-06-05T10:35:15Z"
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Payment processing |
| `completed` | Payment successful |
| `failed` | Payment failed |
| `cancelled` | Payment cancelled by user or merchant |

## Step 3: Get Virtual Accounts (Optional)

### Endpoint
```
GET /api/payment/accounts?page=1
```

### Headers
```
Authorization: Bearer <LENCO_API_KEY>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |

### Example Request (cURL)
```bash
curl -X GET http://localhost:5000/api/payment/accounts?page=1 \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx"
```

### Example Response
```json
{
  "data": [
    {
      "account_id": "acc_001",
      "account_number": "9876543210",
      "bank_name": "Stanbic Bank",
      "currency": "UGX",
      "account_holder": "Your Business Name",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_pages": 2,
    "total_items": 15
  }
}
```

## Complete End-to-End Example

### 1. Initialize Payment
```javascript
const axios = require('axios');

const paymentData = {
  amount: 10000,
  reference: `TXN${Date.now()}`,
  phone: "256701234567",
  operator: "MTN",
  country: "UG",
  bearer: "customer"
};

const response = await axios.post(
  'http://localhost:5000/api/payment/request',
  paymentData,
  {
    headers: {
      'Authorization': 'Bearer sk_live_xxxxxxxxxxxxx'
    }
  }
);

console.log('Payment initiated:', response.data);
const txnReference = response.data.reference;
```

### 2. Verify Payment After Delay
```javascript
// Wait for user to complete payment on their phone
setTimeout(async () => {
  const statusResponse = await axios.get(
    `http://localhost:5000/api/payment/verify/${txnReference}`,
    {
      headers: {
        'Authorization': 'Bearer sk_live_xxxxxxxxxxxxx'
      }
    }
  );

  console.log('Payment status:', statusResponse.data);
  
  if (statusResponse.data.status === 'completed') {
    console.log('✓ Payment successful');
  } else if (statusResponse.data.status === 'failed') {
    console.log('✗ Payment failed');
  } else {
    console.log('⏳ Payment still pending');
  }
}, 5000);
```

## Error Handling Guide

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing or invalid API key | Verify `LENCO_API_KEY` in `.env` or headers |
| 400 Bad Request | Invalid parameters | Validate phone format, amount, country code |
| 404 Not Found | Invalid transaction reference | Check reference spelling and format |
| 500 Internal Server Error | Lenco API down or network issue | Retry request after delay |

### Retry Strategy
```javascript
const retryRequest = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
};
```

## Best Practices

1. **Use Unique References**: Always generate unique transaction references to prevent duplicate payments
   ```javascript
   const reference = `TXN${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
   ```

2. **Store Transaction Data**: Save payment details in your database before API call
   ```javascript
   await db.transactions.create({
     reference,
     amount,
     phone,
     status: 'pending',
     created_at: new Date()
   });
   ```

3. **Implement Webhooks**: Listen for payment confirmation webhooks from Lenco instead of polling
   - Set webhook URL in Lenco dashboard
   - Verify webhook signatures
   - Update transaction status upon receipt

4. **Validate Input**: Always validate client input before sending to Lenco
   ```javascript
   if (!phone.match(/^256\d{9}$/)) {
     throw new Error('Invalid Uganda phone number');
   }
   ```

5. **Use Bearer Tokens**: Include authorization header in all requests
   ```javascript
   headers: { 'Authorization': `Bearer ${apiKey}` }
   ```

6. **Log Transactions**: Maintain audit logs for compliance
   ```javascript
   logger.info(`Payment: ref=${reference}, amount=${amount}, status=${status}`);
   ```

7. **Handle Timeouts**: Set reasonable timeouts for external API calls
   ```javascript
   axios.defaults.timeout = 30000; // 30 seconds
   ```

## Environment Setup

Create `.env` file:
```
PORT=5000
LENCO_API_KEY=sk_live_xxxxxxxxxxxxx
NODE_ENV=production
```

## Starting the Server

```bash
npm install
npm start
# or
node server.js
```

Server will output:
```
Server running on port 5000
```

## Supported Countries & Operators

- **Uganda (UG)**: MTN, Airtel, Vodafone
- **Kenya (KE)**: Safaricom, Airtel, Equity Bank
- **Ghana (GH)**: MTN, Vodafone, Airtel
- **Tanzania (TZ)**: Vodafone, Airtel, Tigo
- **Rwanda (RW)**: MTN, Airtel

Check Lenco documentation for complete list and latest updates.

## Support

For issues or questions:
- Contact: support@lenco.co
- Lenco API Docs: https://docs.lenco.co
- GitHub Issues: Report bugs in project repository
