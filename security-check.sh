#!/bin/bash
# Security Check Script for Visora
# Run this before committing or deploying

echo "🔐 Running Security Check..."
echo ""

# Check if .env files are in git
echo "1. Checking for .env files in git..."
if git ls-files | grep -E "\.env$|\.env\.local|\.env\.figma" > /dev/null; then
    echo "❌ ERROR: .env files are tracked by git!"
    echo "   Run: git rm --cached .env .env.local .env.figma backend/.env"
    exit 1
else
    echo "✅ No .env files tracked by git"
fi

echo ""

# Check for hardcoded API keys
echo "2. Checking for hardcoded API keys..."
if grep -r "AIza[a-zA-Z0-9_-]*" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.example" --exclude="*.md" . > /dev/null; then
    echo "⚠️  WARNING: Found potential API keys in source code!"
    echo "   Check these files:"
    grep -r "AIza[a-zA-Z0-9_-]*" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.example" --exclude="*.md" . | head -5
    exit 1
else
    echo "✅ No hardcoded Gemini API keys found"
fi

echo ""

# Check for hardcoded Firebase keys
echo "3. Checking for hardcoded Firebase keys..."
if grep -r "firebase.*apiKey.*:.*['\"]" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.example" --exclude="*.md" . | grep -v "import.meta.env" > /dev/null; then
    echo "⚠️  WARNING: Found potential hardcoded Firebase keys!"
    exit 1
else
    echo "✅ No hardcoded Firebase keys found"
fi

echo ""

# Check .gitignore
echo "4. Verifying .gitignore..."
if grep -q "^\.env\*$" .gitignore && grep -q "^backend/\.env\*$" .gitignore; then
    echo "✅ .gitignore properly configured"
else
    echo "❌ ERROR: .gitignore missing .env patterns"
    exit 1
fi

echo ""

# Check for .env.example
echo "5. Checking for .env.example files..."
if [ -f ".env.example" ] && [ -f "backend/.env.example" ]; then
    echo "✅ .env.example files exist"
else
    echo "⚠️  WARNING: Missing .env.example files"
fi

echo ""

# Check if .env files exist locally
echo "6. Checking for local .env files..."
if [ -f ".env" ] && [ -f "backend/.env" ]; then
    echo "✅ Local .env files exist"
else
    echo "⚠️  WARNING: Missing local .env files (needed for development)"
fi

echo ""
echo "🎉 Security check complete!"
echo ""
echo "Next steps:"
echo "1. Review any warnings above"
echo "2. Ensure all API keys are in .env files"
echo "3. Never commit .env files to git"
echo "4. Use environment variables in your hosting platform"
