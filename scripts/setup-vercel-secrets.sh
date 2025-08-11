#!/bin/bash

# Setup Vercel secrets for GitHub Actions
# Usage: ./scripts/setup-vercel-secrets.sh YOUR_VERCEL_TOKEN

if [ -z "$1" ]; then
  echo "❌ Error: Vercel token required"
  echo ""
  echo "Usage: ./scripts/setup-vercel-secrets.sh YOUR_VERCEL_TOKEN"
  echo ""
  echo "🔗 Get your token from: https://vercel.com/account/tokens"
  echo ""
  echo "1. Go to https://vercel.com/account/tokens"
  echo "2. Click 'Create Token'"
  echo "3. Give it a name like 'GitHub Actions - Mixie'"
  echo "4. Copy the token and run:"
  echo "   ./scripts/setup-vercel-secrets.sh YOUR_TOKEN_HERE"
  exit 1
fi

VERCEL_TOKEN="$1"

echo "🚀 Setting up Vercel secrets for GitHub Actions..."
echo ""

# Set the GitHub secrets
echo "📝 Adding VERCEL_TOKEN..."
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN

echo "📝 Adding VERCEL_ORG_ID..."
echo "team_BzqR7OsXA88yNydyCnLG0Tok" | gh secret set VERCEL_ORG_ID

echo "📝 Adding VERCEL_PROJECT_ID..."
echo "prj_WiwskXaLyTg65SFFBkI8Khcf3JaK" | gh secret set VERCEL_PROJECT_ID

echo ""
echo "✅ All Vercel secrets have been set!"
echo ""
echo "🎯 GitHub Actions workflow should now be able to deploy to Vercel"
echo "📊 You can verify the secrets at: https://github.com/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/settings/secrets/actions"
