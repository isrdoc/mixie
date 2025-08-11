#!/bin/bash

# Simple wrapper for creating new feature branches
# Usage: ./scripts/new-feature.sh BRANCH_NAME

if [ -z "$1" ]; then
    echo "🚀 Create New Feature Branch"
    echo ""
    echo "Usage: $0 BRANCH_NAME"
    echo ""
    echo "Examples:"
    echo "  $0 user-authentication"
    echo "  $0 playlist-sharing"
    echo "  $0 music-recommendations"
    echo ""
    echo "This will:"
    echo "  ✅ Create feat/BRANCH_NAME from develop"
    echo "  ✅ Set up Supabase branch environment"
    echo "  ✅ Configure GitHub Actions variables"
    echo "  ✅ Push initial commit to trigger setup"
    echo ""
    exit 1
fi

# Call the main script
exec "./scripts/create-feature-branch.sh" "$1"
