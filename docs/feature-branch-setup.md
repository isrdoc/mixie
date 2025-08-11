# Feature Branch Setup Guide

This guide explains how to create a new feature branch with automatic Supabase environment setup.

## Quick Start

To create a new feature branch, simply run:

```bash
./scripts/new-feature.sh your-feature-name
```

This will automatically:
- ✅ Create `feat/your-feature-name` from `dev`
- ✅ Create Pull Request to trigger Supabase setup
- ✅ Set up branch-specific Supabase project
- ✅ Configure GitHub Actions environment variables
- ✅ Complete isolated development environment

## Detailed Process

### What the Script Does

1. **Branch Creation**: Creates `feat/BRANCH_NAME` from the `dev` branch (or `main` if `dev` doesn't exist)

2. **Initial Commit**: Creates and pushes an initial commit

3. **Pull Request**: Creates a draft PR to trigger Supabase branch creation

4. **Supabase Setup**: Waits for you to confirm the Supabase project is created

5. **Environment Extraction**: Runs `npm run env:extract` to get Supabase variables

6. **GitHub Variables**: Runs `npm run env:create-github` to set up GitHub Actions

7. **Cleanup**: Removes temporary files and makes final commit

### Prerequisites

- Git repository with proper remotes configured
- GitHub CLI installed and authenticated (`gh auth login`)
- Node.js and npm installed
- Access to Supabase dashboard for project creation

### Example Usage

```bash
# Create a user authentication feature
./scripts/new-feature.sh user-authentication

# Create a playlist sharing feature  
./scripts/new-feature.sh playlist-sharing

# Create a music recommendation feature
./scripts/new-feature.sh music-recommendations
```

### Manual Steps Required

During the setup process, you'll need to:

1. **Pull Request**: The script automatically creates a draft PR which triggers Supabase branch creation
2. **Supabase Project Creation**: When prompted, go to your Supabase dashboard and verify that a new project was created for your branch
3. **Environment Variables**: The script will extract and configure environment variables automatically
4. **Confirmation**: Press Enter when the Supabase project is ready

### Alternative Methods

If you prefer to run the individual steps manually:

```bash
# Create branch manually
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name

# Extract Supabase environment
npm run env:extract

# Create GitHub variables
npm run env:create-github
```

### Available Scripts

- `npm run branch:create BRANCH_NAME` - Full automated setup
- `npm run env:extract` - Extract Supabase environment variables
- `npm run env:create-github` - Create GitHub Actions variables

### Troubleshooting

**GitHub CLI not authenticated:**
```bash
gh auth login
```

**Supabase extraction fails:**
```bash
npm run env:extract
```

**GitHub variables creation fails:**
```bash
npm run env:create-github
```

**Branch already exists:**
Choose a different branch name or delete the existing branch:
```bash
git branch -D feat/branch-name
git push origin --delete feat/branch-name
```

### What Happens After Setup

Once setup is complete:

1. **Automatic Deployments**: Every push triggers GitHub Actions workflow
2. **Branch-Specific Database**: Your feature uses an isolated Supabase project
3. **Environment Variables**: All configuration is automatically injected
4. **Vercel Deployment**: Branch deployments are automatically created

### Next Steps

1. Start developing your feature
2. Test with the isolated database environment
3. Push commits to trigger automatic deployments
4. Create a pull request when ready

The branch-specific environment ensures complete isolation during development!
