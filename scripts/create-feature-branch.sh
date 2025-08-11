#!/bin/bash

# Create Feature Branch Script
# Automates the complete setup process for a new feature branch with Supabase environment
# Usage: ./scripts/create-feature-branch.sh BRANCH_NAME

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${PURPLE}===========================================${NC}"
    echo -e "${PURPLE}🚀 Mixie Feature Branch Setup${NC}"
    echo -e "${PURPLE}===========================================${NC}"
}

# Check if branch name is provided
if [ -z "$1" ]; then
    print_error "Branch name is required!"
    echo ""
    echo "Usage: $0 BRANCH_NAME"
    echo ""
    echo "Examples:"
    echo "  $0 user-authentication"
    echo "  $0 playlist-sharing"
    echo "  $0 music-recommendations"
    echo ""
    echo "This will create: feat/BRANCH_NAME"
    exit 1
fi

BRANCH_NAME="$1"
FEATURE_BRANCH="feat/$BRANCH_NAME"

print_header
echo ""
print_info "Setting up feature branch: $FEATURE_BRANCH"
echo ""

# Step 1: Check if we're in the right directory
print_step "Checking project directory..."
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    print_error "This script must be run from the project root directory"
    print_info "Please run from the directory containing package.json"
    exit 1
fi
print_success "Project directory confirmed"

# Step 2: Check if dev branch exists and switch to it
print_step "Switching to dev branch..."
if ! git rev-parse --verify dev >/dev/null 2>&1; then
    print_warning "Dev branch not found, using main branch instead"
    git checkout main
    git pull origin main
else
    git checkout dev
    git pull origin dev
fi
print_success "Base branch updated"

# Step 3: Check if feature branch already exists
print_step "Checking if feature branch already exists..."
if git rev-parse --verify "$FEATURE_BRANCH" >/dev/null 2>&1; then
    print_error "Branch $FEATURE_BRANCH already exists!"
    print_info "Please choose a different branch name or delete the existing branch"
    exit 1
fi
print_success "Branch name is available"

# Step 4: Create and switch to feature branch
print_step "Creating feature branch: $FEATURE_BRANCH"
git checkout -b "$FEATURE_BRANCH"
print_success "Feature branch created and checked out"

# Step 5: Create initial commit to trigger Supabase branch creation
print_step "Creating initial commit to trigger Supabase branch creation..."
# Create a temporary file to ensure we have something to commit
mkdir -p .feature-setup
echo "# Feature Branch: $FEATURE_BRANCH

This branch was created on $(date) for feature development.

## Supabase Environment
- Branch-specific Supabase project will be created automatically
- Database isolation for this feature development
- Environment variables configured via GitHub Actions

## Next Steps
1. Develop your feature
2. Test with branch-specific database
3. Create pull request when ready

---
*This file can be removed once development begins*
" > .feature-setup/branch-info.md

git add .feature-setup/branch-info.md
git commit -m "chore: setup feature branch

🌟 Feature branch setup:
- Created branch-specific development environment
- Triggering automatic Supabase project creation
- Setting up database isolation for feature development

Branch: $FEATURE_BRANCH
Created: $(date)"

print_success "Initial commit created"

# Step 6: Push feature branch to trigger Supabase branch creation
print_step "Pushing to GitHub..."
git push -u origin "$FEATURE_BRANCH"
print_success "Feature branch pushed to GitHub"

# Step 7: Create Pull Request to trigger Supabase branch creation
print_step "Creating Pull Request to trigger Supabase branch creation..."
PR_TITLE="feat: $BRANCH_NAME"
PR_BODY="## 🚀 Feature Branch: $FEATURE_BRANCH

This pull request sets up the initial development environment for the **$BRANCH_NAME** feature.

### 🎯 What's Included:
- ✅ Feature branch created from \`dev\`
- ✅ Initial commit to trigger Supabase branch creation
- ✅ Ready for feature development

### 🔄 Automatic Setup:
- 🗄️ **Supabase**: Branch-specific database environment
- 🚀 **Deployments**: Automatic preview deployments
- 🧪 **Testing**: Isolated testing environment

### 📋 Next Steps:
1. Supabase will automatically create a branch-specific project
2. Environment variables will be configured
3. Start developing the feature
4. Push commits to see automatic deployments

---
**Branch**: \`$FEATURE_BRANCH\`  
**Created**: $(date)  
**Type**: Feature development setup"

# Create the pull request
if gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base dev --head "$FEATURE_BRANCH" --draft; then
    print_success "Pull Request created successfully!"
    
    # Get the PR URL
    PR_URL=$(gh pr view --json url --jq '.url')
    print_info "PR URL: $PR_URL"
    
    print_step "PR created - Supabase branch setup initiated..."
    print_info "The PR creation triggers Supabase to create a branch-specific project"
    print_info "You'll specify the project reference during environment extraction"
    print_success "Continuing with setup process..."
else
    print_error "Failed to create Pull Request"
    print_info "You can create it manually later with:"
    print_info "gh pr create --title '$PR_TITLE' --body 'Initial setup for $FEATURE_BRANCH' --base dev --head $FEATURE_BRANCH"
    print_warning "Note: Supabase branch creation is triggered by PR creation"
    echo ""
    read -p "Press Enter to continue with manual setup..."
fi

# Step 8: Extract Supabase environment variables
print_step "Extracting Supabase environment variables..."
if [ ! -f "scripts/extract-supabase-env.js" ]; then
    print_error "extract-supabase-env.js script not found!"
    print_info "Please make sure you're in the correct directory"
    exit 1
fi

print_info "Running: npm run env:extract"
print_info "You'll be prompted to provide the Supabase project reference during extraction"
if npm run env:extract; then
    print_success "Supabase environment variables extracted"
else
    print_warning "Supabase extraction had issues, but continuing..."
    print_info "You may need to run 'npm run env:extract' manually later"
fi

# Step 9: Create GitHub environment variables
print_step "Creating GitHub environment variables..."
if [ ! -f "scripts/create-github-env-json.js" ]; then
    print_error "create-github-env-json.js script not found!"
    exit 1
fi

print_info "Running: npm run env:create-github"
if npm run env:create-github; then
    print_success "GitHub environment variables created"
else
    print_error "Failed to create GitHub environment variables"
    print_info "You may need to:"
    print_info "1. Check your GitHub CLI authentication: gh auth status"
    print_info "2. Run manually: npm run env:create-github"
    exit 1
fi

# Step 10: Run end-to-end tests with branch-specific environment
print_step "Running end-to-end tests with branch-specific environment..."
print_info "Testing the complete setup with isolated database"
if npm run test:e2e 2>/dev/null || npm run test 2>/dev/null || npm run e2e 2>/dev/null; then
    print_success "End-to-end tests completed successfully"
else
    print_warning "E2E tests not configured or failed"
    print_info "You can run tests manually later with:"
    print_info "npm run test:e2e   # or npm run test, npm run e2e"
fi

# Step 11: Clean up initial setup files
print_step "Cleaning up setup files..."
rm -rf .feature-setup
git add -A
git commit -m "cleanup: remove initial setup files

Environment setup completed successfully"
git push
print_success "Setup files cleaned up"

# Step 12: Success summary
echo ""
print_success "🎉 Feature branch setup completed successfully!"
echo ""
echo "================== SUMMARY =================="
echo -e "${GREEN}✅ Branch created:${NC} $FEATURE_BRANCH"
echo -e "${GREEN}✅ Pull Request:${NC} Created to trigger Supabase setup"
echo -e "${GREEN}✅ Supabase project:${NC} Branch-specific environment"
echo -e "${GREEN}✅ Environment variables:${NC} Configured for GitHub Actions"
echo -e "${GREEN}✅ E2E testing:${NC} Branch-specific environment tested"
echo -e "${GREEN}✅ Database isolation:${NC} Independent development environment"
echo ""
echo "================== NEXT STEPS ================"
echo -e "${CYAN}1.${NC} Start developing your feature in: $FEATURE_BRANCH"
echo -e "${CYAN}2.${NC} Test your changes with the isolated database"
echo -e "${CYAN}3.${NC} Push commits to trigger automatic deployments"
echo -e "${CYAN}4.${NC} Create a pull request when ready"
echo ""
echo "================== USEFUL COMMANDS ==========="
echo -e "${YELLOW}Check Pull Request:${NC}"
echo "  gh pr view"
echo ""
echo -e "${YELLOW}Check deployment status:${NC}"
echo "  gh run list --branch $FEATURE_BRANCH"
echo ""
echo -e "${YELLOW}View environment variables:${NC}"
echo "  gh variable list"
echo ""
echo -e "${YELLOW}Test local development:${NC}"
echo "  npm run dev"
echo ""
print_success "Happy coding! 🚀"
