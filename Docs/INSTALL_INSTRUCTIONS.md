# Database Installation Instructions

## Quick Install

A single SQL file (`install_all.sql`) contains both the database schema and all seed data. This file can be installed in one command.

### Prerequisites

- MySQL 5.7+ or MariaDB 10.2+
- Database user with CREATE TABLE privileges
- An empty database (or database you want to install into)

### Installation Steps

1. **Create a database** (if it doesn't exist):
   ```sql
   CREATE DATABASE office_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Install the schema and seed data**:
   ```bash
   mysql -u your_username -p office_app < install_all.sql
   ```
   
   Or using MySQL command line:
   ```sql
   USE office_app;
   SOURCE /path/to/install_all.sql;
   ```

### What's Included

The `install_all.sql` file contains:

1. **Schema Creation** (~500 lines)
   - All 30+ tables
   - Foreign key constraints
   - Indexes for performance
   - Proper table ordering (handles dependencies)

2. **Seed Data** (~1,750 lines)
   - 20 languages (en, de, hu, and more)
   - 6 object types (person, company, user, document, file, employee)
   - 30+ object statuses (scoped to object types)
   - 51 object relation types
   - All lookup tables populated (sexes, salutations, countries, currencies, etc.)
   - Multi-language translations (English, German, Hungarian)

### File Details

- **File**: `install_all.sql`
- **Size**: ~2,287 lines
- **Execution Time**: ~5-10 seconds (depending on server)
- **Idempotent**: Uses `CREATE TABLE IF NOT EXISTS` - safe to run multiple times (will skip existing tables)

### Verification

After installation, verify the database:

```sql
-- Check table count (should be 30+ tables)
SHOW TABLES;

-- Check languages
SELECT COUNT(*) FROM languages;  -- Should be 20

-- Check object types
SELECT * FROM object_types;  -- Should show 6 types

-- Check translations
SELECT COUNT(*) FROM translations;  -- Should be hundreds of translations
```

### Troubleshooting

**Error: Foreign key constraint fails**
- The script temporarily disables foreign key checks during table creation
- If you still get errors, ensure you're using MySQL 5.7+ or MariaDB 10.2+

**Error: Table already exists**
- The script uses `CREATE TABLE IF NOT EXISTS`, so existing tables won't cause errors
- If you want to start fresh, drop the database first:
  ```sql
  DROP DATABASE office_app;
  CREATE DATABASE office_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

**Error: Duplicate entry**
- Seed data uses `INSERT INTO` (not `INSERT IGNORE`)
- If you run the script twice, you'll get duplicate key errors
- To reinstall, drop and recreate the database first

### Alternative: Separate Files

If you prefer to install schema and seed data separately:

1. **Schema only**: Use `Docs/01_schema.sql`
2. **Seed data only**: Use `Docs/02_seed_data.sql`

**Note**: The separate files require proper ordering. The combined file (`install_all.sql`) handles this automatically.

### Next Steps

After installation:

1. **Create your first user** (via API or direct SQL)
2. **Configure n8n webhooks** to connect to this database
3. **Start the frontend application** and connect to your API

### Support

For issues or questions:
- Check `Docs/PHASE1_ANALYSIS.md` for detailed schema documentation
- Review `Docs/01_schema.sql` and `Docs/02_seed_data.sql` for individual file details

