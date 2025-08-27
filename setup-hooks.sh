#!/bin/bash

# Setup script to configure git hooks for development workflow enforcement

echo "🔧 Setting up development workflow git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy our custom hooks
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks configured successfully!"
echo ""
echo "📋 Workflow Summary:"
echo "  • index.html modifications are now blocked"
echo "  • All new development should use /src/ structure"
echo "  • Emergency override: git commit --no-verify"
echo "  • Migration override: MIGRATION=true git commit"
echo ""
echo "📖 See CLAUDE.md for complete workflow documentation"