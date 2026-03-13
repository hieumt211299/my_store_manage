Init your local project: supabase init
Link your cloud project to your local project: supabase link
Pull down the database from your cloud project: supabase db pull
Now your database is in sync and you can start it locally: supabase db start

# 1. Dump everything from production (schema)
supabase db dump --linked > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# 1. Dump everything from production (database)
supabase db dump --data-only > production_data.sql

# 2. Pull schema from production
supabase db pull

# 3. Reset local DB (applies schema + data if seed.sql exists)
supabase db reset

# 4. Import production data to local
psql "postgresql://postgres:postgres@localhost:54322/postgres" < production_data.sql

## Migration to Production

### Step 1: Check migration status
```bash
supabase migration list
```
Shows which migrations are applied locally vs production:
- Local: migrations in your local project
- Remote: migrations applied to production
- Empty Remote column means not yet applied to production

### Step 2: Create backup before migration (IMPORTANT!)
```bash
# Full backup (schema + data)
supabase db dump --linked > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Data-only backup
supabase db dump --linked --data-only > production_data_backup.sql
```

### Step 3: Apply migrations to production
```bash
supabase db push
```
This will:
- Show you which migrations will be applied
- Ask for confirmation
- Apply all pending migrations to production database
- **⚠️ WARNING: This modifies your production database!**

### Step 4: Deploy Edge Functions (if any)
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function-name
```

### Step 5: Verify migration success
```bash
# Check migration status again
supabase migration list

# Test your application
# Make sure all features work correctly
```

## Troubleshooting

### RLS Policy Errors
If you get "violates row-level security policy" errors:
1. Check if user is authenticated in your app
2. Verify RLS policies allow the operation
3. Create/fix policies:
   ```sql
   -- Example: Allow all operations for authenticated users
   CREATE POLICY "Enable all operations for authenticated users" 
   ON "public"."table_name" 
   USING (auth.role() = 'authenticated');
   ```

### Rollback if needed
If migration fails, restore from backup:
```bash
# Reset production to backup state
psql "your-production-connection-string" < backup_file.sql
```


