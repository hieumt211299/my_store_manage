Init your local project: supabase init
Link your cloud project to your local project: supabase link
Pull down the database from your cloud project: supabase db pull
Now your database is in sync and you can start it locally: supabase db start




# 1. Dump everything from production 
supabase db dump --data-only > production_data.sql

# 2. Pull schema from production
supabase db pull

# 3. Reset local DB (applies schema + data if seed.sql exists)
supabase db reset

# 4. Import production data to local
psql "postgresql://postgres:postgres@localhost:54322/postgres" < production_data.sql