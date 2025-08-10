# Testing Supabase Preview Branch Integration

This guide explains how to test the integration between Vercel and Supabase preview branches using the test migration and test script.

## 🧪 What We're Testing

The test migration (`20250115000000_test_preview_branch_integration.sql`) creates:

- **Test Table**: `test_integration` with sample data
- **Test Function**: `test_preview_branch_function()`
- **Test View**: `test_integration_summary`
- **RLS Policies**: Row-level security for the test table
- **Indexes**: Performance optimizations

## 🚀 Testing Workflow

### 1. **Create a Feature Branch**

```bash
# Create and switch to a new feature branch
git checkout -b feature/test-preview-integration

# Push to trigger Vercel preview deployment
git push origin feature/test-preview-integration
```

### 2. **Wait for Vercel Preview Deployment**

- Vercel will automatically create a preview deployment
- The preview URL will be: `https://feature-test-preview-integration-your-project.vercel.app`
- Supabase will create a preview database branch

### 3. **Sync Environment Variables**

```bash
# Pull the latest preview environment variables
pnpm env:sync:feat

# This creates/updates .env.feat with preview database credentials
```

### 4. **Apply the Test Migration**

```bash
# Start local Supabase (if testing locally)
pnpm db:start

# Apply the test migration
pnpm supabase db reset

# Or apply just the new migration
pnpm supabase migration up
```

### 5. **Run the Integration Test**

```bash
# Test the preview branch integration
pnpm test:preview
```

## 📊 Test Results Interpretation

### ✅ **Successful Tests**

- **Database Connection**: Can connect to Supabase preview database
- **Data Querying**: Can read from the test table
- **Custom Function**: Can execute the test function
- **View Access**: Can query the summary view
- **Data Insertion**: Can insert new test records

### ⚠️ **Expected Warnings** (Before Migration)

- Function test may fail if migration hasn't been applied
- View access may fail if migration hasn't been applied
- Insert operations may fail due to RLS policies

### ❌ **Failed Tests**

- **Connection Issues**: Check environment variables and Supabase status
- **Permission Errors**: Verify RLS policies and user authentication
- **Migration Errors**: Check if the migration was applied correctly

## 🔧 Troubleshooting

### Environment Variables Not Loading

```bash
# Check if .env.feat exists
ls -la .env.feat

# Re-sync environment variables
pnpm env:sync:feat

# Verify variables are loaded
cat .env.feat
```

### Supabase Not Running

```bash
# Check Supabase status
pnpm db:status

# Start Supabase if needed
pnpm db:start

# Reset database if needed
pnpm db:reset
```

### Migration Issues

```bash
# Check migration status
pnpm supabase migration list

# Apply pending migrations
pnpm supabase migration up

# Check database schema
pnpm supabase db diff
```

## 🌐 Preview Environment Verification

### Check Vercel Preview

```bash
# List preview deployments
vercel ls --filter=preview

# Check environment variables
vercel env ls --environment=preview
```

### Check Supabase Preview Branch

```bash
# List database branches (if using Supabase CLI)
supabase projects list --filter=preview

# Check connection in Supabase dashboard
# Go to your project → Settings → Database → Connection string
```

## 📝 Test Data Verification

After running the test, you should see:

1. **Initial Test Records** (inserted by migration):

   - `preview_branch_test`
   - `integration_verification`
   - `environment_sync`

2. **New Test Record** (inserted by test script):

   - `preview_branch_verification` with timestamp

3. **Summary View** showing test counts by branch

## 🎯 Next Steps

Once the preview branch integration is working:

1. **Verify Production Migration**: Apply the test migration to production
2. **Clean Up**: Remove test data and tables from production
3. **Monitor**: Watch for any issues in preview deployments
4. **Scale**: Use this pattern for other feature migrations

## 🔗 Useful Commands

```bash
# Quick test workflow
git checkout -b feature/your-feature
git push origin feature/your-feature
pnpm env:sync:feat
pnpm test:preview

# Database management
pnpm db:start          # Start local Supabase
pnpm db:stop           # Stop local Supabase
pnpm db:reset          # Reset with migrations
pnpm db:status         # Check service status

# Environment management
pnpm env:sync:feat     # Sync preview environment
pnpm test:preview      # Test preview integration
```

## 📚 Additional Resources

- [Supabase Database Branching](https://supabase.com/docs/guides/getting-started/local-development#database-branching)
- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
