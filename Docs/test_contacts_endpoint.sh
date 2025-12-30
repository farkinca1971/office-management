#!/bin/bash

# Test script for Contacts API endpoints
# Usage: ./test_contacts_endpoint.sh

BASE_URL="https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1"

echo "========================================="
echo "Testing Contacts API Endpoints"
echo "Base URL: $BASE_URL"
echo "========================================="
echo ""

# Test 1: GET all contacts for object_id = 1
echo "📋 Test 1: GET /objects/1/contacts (List contacts for object 1)"
echo "Request: GET $BASE_URL/objects/1/contacts"
echo "---"
curl -X GET "$BASE_URL/objects/1/contacts" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq . 2>/dev/null || echo "Response received (not JSON or endpoint not configured)"
echo ""
echo "========================================="
echo ""

# Test 2: GET all contacts with filter (active only)
echo "📋 Test 2: GET /objects/1/contacts?is_active=true (Filter active contacts)"
echo "Request: GET $BASE_URL/objects/1/contacts?is_active=true"
echo "---"
curl -X GET "$BASE_URL/objects/1/contacts?is_active=true" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq . 2>/dev/null || echo "Response received (not JSON or endpoint not configured)"
echo ""
echo "========================================="
echo ""

# Test 3: POST create new contact (will fail if endpoint not configured)
echo "📝 Test 3: POST /objects/1/contacts (Create new contact)"
echo "Request: POST $BASE_URL/objects/1/contacts"
echo "Body: {\"contact_type_id\": 1, \"contact_value\": \"test@example.com\"}"
echo "---"
curl -X POST "$BASE_URL/objects/1/contacts" \
  -H "Content-Type: application/json" \
  -d '{"contact_type_id": 1, "contact_value": "test@example.com"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq . 2>/dev/null || echo "Response received (not JSON or endpoint not configured)"
echo ""
echo "========================================="
echo ""

# Test 4: GET single contact by ID (using ID 1 as example)
echo "🔍 Test 4: GET /contacts/1 (Get single contact)"
echo "Request: GET $BASE_URL/contacts/1"
echo "---"
curl -X GET "$BASE_URL/contacts/1" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq . 2>/dev/null || echo "Response received (not JSON or endpoint not configured)"
echo ""
echo "========================================="
echo ""

# Expected Results:
echo "📊 Expected Results:"
echo "---"
echo "✅ HTTP 200: Endpoint is configured and working"
echo "✅ HTTP 404: Endpoint path not found (needs n8n webhook setup)"
echo "✅ HTTP 500: Endpoint exists but has errors (check n8n workflow)"
echo "❌ Connection refused: n8n is not accessible"
echo ""
echo "If you see 404 errors, the contacts endpoint needs to be activated in n8n."
echo "Follow the guide in: Docs/CONTACTS_ENDPOINT_ACTIVATION_GUIDE.md"
echo ""
echo "========================================="
