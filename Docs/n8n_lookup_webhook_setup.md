# n8n Lookup Tables Webhook Setup Guide

Complete setup guide for the unified lookup tables webhook endpoint.

## Workflow Structure

```
Webhook (/api/v1/lookups/:lookup_type)
  ↓
Extract (Code Node - builds SQL query)
  ↓
MySQL (executes query)
  ↓
Format Response (Code Node - formats as { success: true, data: [...] })
  ↓
Respond to Webhook (sends formatted response)
```

## Node Configurations

### 1. Webhook Node

**Settings:**
- **HTTP Method**: GET (or POST)
- **Path**: `/api/v1/lookups/:lookup_type`
- **Response Mode**: "Using 'Respond to Webhook' Node"
- **Options**: 
  - Enable CORS if needed

**Output:**
- `params.lookup_type` - The lookup type from the URL path
- `query.*` - Query parameters (e.g., `object_type_id`, `code`, `language_id`)

---

### 2. Extract Node (Code Node)

**Settings:**
- **Mode**: "Run Once for All Items"
- **Language**: JavaScript
- **Code**: Copy from `n8n_lookup_node_code.js`

**What it does:**
- Extracts `lookup_type` from path params
- Normalizes hyphens to underscores (e.g., `object-types` → `object_types`)
- Validates lookup type
- Builds SQL query based on lookup type
- Returns: `{ query: "...", lookup_type: "...", parameters: {...} }`

---

### 3. MySQL Node

**Settings:**
- **Operation**: Execute Query
- **Query**: `{{ $json.query }}`
- **Options**:
  - Return Field Names: true (recommended)

**What it does:**
- Executes the SQL query from the Extract node
- Returns each row as a separate item
- Each item has a `json` property with the row data

**Output Format:**
```
Item 1: { json: { id: 1, code: "en", is_active: true } }
Item 2: { json: { id: 2, code: "de", is_active: true } }
Item 3: { json: { id: 3, code: "hu", is_active: true } }
```

---

### 4. Format Response Node (Code Node)

**Settings:**
- **Mode**: "Run Once for All Items" ⚠️ **IMPORTANT**
- **Language**: JavaScript
- **Code**: Copy from `n8n_lookup_response_formatter.js`

**What it does:**
- Collects all MySQL rows
- Formats them into: `{ success: true, data: [...] }`

**Output:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "en", "is_active": true },
    { "id": 2, "code": "de", "is_active": true },
    { "id": 3, "code": "hu", "is_active": true }
  ]
}
```

---

### 5. Respond to Webhook Node

**Settings:**
- **Respond With**: "JSON" or "First Item JSON" ⚠️ **IMPORTANT**
- **Response Code**: 200
- **Response Body**: Leave default (it will use `$json` from previous node)

**OR if using "Respond With: JSON":**

**Response Body (JSON):**
```json
{{ $json }}
```

**OR if using "Respond With: First Item JSON":**

The node will automatically send the first item's JSON, which should be:
```json
{
  "success": true,
  "data": [...]
}
```

---

## Common Issues and Fixes

### Issue 1: Getting array of items instead of formatted response

**Problem:** "Respond to Webhook" is set to `respondWith: "allIncomingItems"`

**Solution:** Change to `respondWith: "json"` or `respondWith: "firstItemJson"`

---

### Issue 2: Empty data array

**Problem:** Format Response node mode is set to "Run Once for Each Item"

**Solution:** Change Format Response node mode to "Run Once for All Items"

---

### Issue 3: MySQL results not being collected

**Problem:** Using `$json.data` instead of `$input.all()`

**Solution:** In Format Response node, use:
```javascript
const mysqlResults = $input.all();
```

---

### Issue 4: Response format is wrong

**Problem:** Respond to Webhook is sending raw MySQL results

**Solution:** 
1. Ensure Format Response node is between MySQL and Respond to Webhook
2. Ensure Format Response node mode is "Run Once for All Items"
3. Ensure Respond to Webhook uses "JSON" or "First Item JSON"

---

## Testing

### Test with curl

```bash
# Test languages
curl "https://your-n8n-instance.com/webhook/your-webhook-id/api/v1/lookups/languages"

# Test object-types (with hyphen)
curl "https://your-n8n-instance.com/webhook/your-webhook-id/api/v1/lookups/object-types"

# Test object_statuses (with underscore)
curl "https://your-n8n-instance.com/webhook/your-webhook-id/api/v1/lookups/object_statuses"

# Test with filter
curl "https://your-n8n-instance.com/webhook/your-webhook-id/api/v1/lookups/object-statuses?object_type_id=1"
```

### Expected Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "en",
      "is_active": true
    },
    {
      "id": 2,
      "code": "de",
      "is_active": true
    }
  ]
}
```

---

## Complete Node Configuration Summary

| Node | Mode | Key Setting |
|------|------|-------------|
| Webhook | - | Path: `/api/v1/lookups/:lookup_type` |
| Extract | Run Once for All Items | Code from `n8n_lookup_node_code.js` |
| MySQL | - | Query: `{{ $json.query }}` |
| Format Response | **Run Once for All Items** | Code from `n8n_lookup_response_formatter.js` |
| Respond to Webhook | - | **Respond With: JSON** or **First Item JSON** |

---

## Debugging Tips

1. **Check each node's output:**
   - Click on each node to see what data it's passing
   - Verify the Format Response node outputs `{ success: true, data: [...] }`

2. **Test Format Response node:**
   - Execute workflow up to Format Response node
   - Verify output is correct format

3. **Check Respond to Webhook:**
   - Ensure it's using the JSON from Format Response node
   - Not sending all items from MySQL node

4. **Browser Network Tab:**
   - Check the actual response received by frontend
   - Verify it matches expected format

