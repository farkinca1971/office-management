# Quick Start: n8n Response Formatters

## TL;DR - What You Need to Do

Your n8n MySQL nodes are returning raw data. The frontend expects wrapped responses with `{ success: true, data: [...] }` format.

### Solution: Add a Code Node After Every MySQL Query

## 📋 Step-by-Step Guide

### 1. Copy This Code
Open [n8n_universal_response_formatter.js](./n8n_universal_response_formatter.js) and copy the entire contents.

### 2. Add to Your Workflow
In your n8n workflow, after your MySQL node:
1. Click the **+** button
2. Select **Code** node
3. Paste the formatter code
4. Click **Execute Node** to test

### 3. Test the Output
The OUTPUT panel should show:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "first_name": "Kisné",
      ...
    }
  ]
}
```

✅ **That's it!** Your API now returns properly formatted responses.

## 🔧 For Specific Endpoints

### GET /api/v1/persons
Use: [n8n_persons_response_formatter.js](./n8n_persons_response_formatter.js)

### GET /api/v1/object-audits/object/:id
Use: [n8n_object_audits_node_code.js](./n8n_object_audits_node_code.js) for the query
PLUS: [n8n_universal_response_formatter.js](./n8n_universal_response_formatter.js) for formatting

**IMPORTANT:** Make sure your audit query includes the username join:
```sql
LEFT JOIN users u ON u.id = oa.created_by
```
See [AUDIT_TABLE_BACKEND_UPDATE.md](./AUDIT_TABLE_BACKEND_UPDATE.md) for details.

### GET /api/v1/lookups/:type
Use: [n8n_lookup_node_code_with_audit_actions.js](./n8n_lookup_node_code_with_audit_actions.js) for the query
PLUS: [n8n_lookup_response_formatter.js](./n8n_lookup_response_formatter.js) for formatting

## 📚 More Information

- **Full Guide:** [N8N_RESPONSE_FORMATTERS_GUIDE.md](./N8N_RESPONSE_FORMATTERS_GUIDE.md)
- **Workflow Structure:** [n8n_workflow_structure.md](./n8n_workflow_structure.md)
- **Audit Table Fix:** [AUDIT_TABLE_BACKEND_UPDATE.md](./AUDIT_TABLE_BACKEND_UPDATE.md)

## ❓ Common Questions

### Q: Which formatter should I use?
**A:** Use **n8n_universal_response_formatter.js** for everything unless you need custom transformations.

### Q: My response shows `success: true` but `data` is empty?
**A:** Check that your MySQL query is returning results. The formatter works correctly - your query might have no matching rows.

### Q: Do I need different formatters for GET by ID vs GET list?
**A:** No! The universal formatter handles both single objects and arrays automatically.

### Q: What about error responses?
**A:** The formatter handles empty results. For actual errors (failed queries), use n8n's error handling workflow and return:
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to fetch data"
  }
}
```

## 🚨 Critical Fix Needed

### Audit Table Username Issue
The audit table is missing usernames. **Fix required:**

1. Open your audit query builder node
2. Update the SQL to include:
   ```sql
   LEFT JOIN users u ON u.id = oa.created_by
   ```
3. Add `u.username AS created_by_username` to the SELECT

See full instructions: [AUDIT_TABLE_BACKEND_UPDATE.md](./AUDIT_TABLE_BACKEND_UPDATE.md)

## 📂 File Index

| File | Purpose |
|------|---------|
| `n8n_universal_response_formatter.js` | ⭐ Use this for most endpoints |
| `n8n_persons_response_formatter.js` | Persons-specific (optional) |
| `n8n_object_audits_node_code.js` | Audit query builder |
| `n8n_lookup_node_code_with_audit_actions.js` | Lookup query builder |
| `n8n_lookup_response_formatter.js` | Lookup formatter |
| `N8N_RESPONSE_FORMATTERS_GUIDE.md` | Detailed documentation |
| `n8n_workflow_structure.md` | Workflow diagrams |
| `AUDIT_TABLE_BACKEND_UPDATE.md` | Audit fix instructions |
