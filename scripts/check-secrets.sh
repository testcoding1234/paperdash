#!/bin/bash
# Security check script to verify no secrets in build output

echo "🔒 Running security checks on build output..."

# Check for potential token patterns
if grep -r "ghp_[a-zA-Z0-9]\{36,\}" dist/ --include="*.js" --include="*.css" --include="*.html" 2>/dev/null; then
  echo "❌ ERROR: Found potential GitHub token in build output!"
  exit 1
fi

if grep -r "github_pat_[a-zA-Z0-9_]\{82,\}" dist/ --include="*.js" --include="*.css" --include="*.html" 2>/dev/null; then
  echo "❌ ERROR: Found potential GitHub PAT in build output!"
  exit 1
fi

# Check for common secret keywords (excluding code patterns)
if grep -r "AKIA[0-9A-Z]\{16\}" dist/ --include="*.js" --include="*.css" --include="*.html" 2>/dev/null; then
  echo "❌ ERROR: Found potential AWS key in build output!"
  exit 1
fi

echo "✅ No secrets found in build output"
echo "✅ Build is safe for deployment"
exit 0
