# Branch-Specific Supabase Environments

This project uses automated branch-specific Supabase environments for complete database isolation during development.

## 🚀 Quick Start

### 1. Extract Supabase Environment Variables
```bash
SUPABASE_PROJECT_REF=your-project-ref pnpm env:extract
```
This will:
- Open Supabase dashboard in browser
- Extract API keys, JWT secret
- Generate fresh database password
- Save to `.env.feat`

### 2. Create Vercel Environment Variable
```bash
pnpm env:create-vercel
```
This will:
- Create a single JSON environment variable in Vercel
- Variable name: `{BRANCH}_SUPABASE_CONFIG`
- Contains all configuration in structured format

### 3. Test Configuration (Optional)
```bash
pnpm env:test-config
```

## 📊 Efficiency & Limits

**JSON Approach Benefits:**
- **1 variable per branch** (vs 12 individual variables)
- **92% reduction** in Vercel environment variable usage
- Support for **~100 branches** instead of ~8
- **Structured configuration** data

**Vercel Limits:**
- Max: 100 environment variables per environment
- Max: 4KB total size
- Our usage: ~1KB per branch

## 🔧 Usage in Your Application

### Using the Utility Library
```javascript
import { getSupabaseClientConfig, getDatabaseConfig } from './lib/supabase-config';

// Automatically detects branch from environment
const config = getSupabaseClientConfig();
const supabase = createClient(config.url, config.anonKey);

// Database configuration
const dbConfig = getDatabaseConfig();
const client = new Client({ connectionString: dbConfig.url });
```

### Manual JSON Parsing
```javascript
// Branch: feat/test-supabase-branch
// Variable: FEAT_TEST_SUPABASE_BRANCH_SUPABASE_CONFIG
const configJson = process.env.FEAT_TEST_SUPABASE_BRANCH_SUPABASE_CONFIG;
const config = JSON.parse(configJson);

const supabaseUrl = config.supabase.url;
const anonKey = config.supabase.anonKey;
const databaseUrl = config.database.url;
```

## 🎯 GitHub Actions Integration

The workflow automatically:
1. Detects branch name: `${{ github.ref_name }}`
2. Sanitizes to env var format: `FEAT_TEST_SUPABASE_BRANCH`
3. Loads JSON config: `FEAT_TEST_SUPABASE_BRANCH_SUPABASE_CONFIG`
4. Parses and uses individual values

See: `.github/workflows/deploy-with-supabase-branches.yml`

## 📁 JSON Configuration Structure

```json
{
  "branch": "feat/test-supabase-branch",
  "timestamp": "2025-08-11T20:57:41.875Z",
  "supabase": {
    "url": "https://project-ref.supabase.co",
    "anonKey": "eyJ...",
    "serviceRoleKey": "eyJ...",
    "jwtSecret": "Wlr..."
  },
  "database": {
    "host": "db.project-ref.supabase.co",
    "user": "postgres.project-ref",
    "password": "generated-password",
    "database": "postgres",
    "url": "postgres://...",
    "urlNonPooling": "postgres://..."
  }
}
```

## 🛠️ Available Scripts

- `pnpm env:extract` - Extract Supabase secrets via browser automation
- `pnpm env:create-vercel` - Create JSON-based Vercel environment variable
- `pnpm env:test-config` - Test the configuration utility
- `pnpm env:check-limits` - Check Vercel environment variable usage

## 🏗️ Architecture

```
Branch Creation
└── Supabase Branch/Project
    └── Playwright Automation
        ├── Extract API Keys
        ├── Extract JWT Secret  
        ├── Generate DB Password
        └── Create JSON Config
            └── Store in Vercel
                └── Use in CI/CD
```

## 🔒 Security

- Database passwords are freshly generated for each branch
- All secrets are encrypted in Vercel environment variables
- No secrets are stored in git repository
- Browser automation runs locally for extraction

## 🧹 Cleanup

To remove environment variables for merged branches:
```bash
vercel env rm BRANCH_NAME_SUPABASE_CONFIG preview --yes
```

Or check current usage:
```bash
pnpm env:check-limits
```