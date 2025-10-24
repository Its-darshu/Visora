# Security Check Script for Visora (PowerShell)
# Run this before committing or deploying

Write-Host "🔐 Running Security Check..." -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# Check if .env files are in git
Write-Host "1. Checking for .env files in git..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String -Pattern "\.env$|\.env\.local|\.env\.figma"
if ($envFiles) {
    Write-Host "❌ ERROR: .env files are tracked by git!" -ForegroundColor Red
    Write-Host "   Run: git rm --cached .env .env.local .env.figma backend/.env" -ForegroundColor Red
    $hasErrors = $true
} else {
    Write-Host "✅ No .env files tracked by git" -ForegroundColor Green
}

Write-Host ""

# Check for hardcoded API keys (Gemini)
Write-Host "2. Checking for hardcoded Gemini API keys..." -ForegroundColor Yellow
$apiKeys = Get-ChildItem -Recurse -File -Exclude "*.example","*.md" | 
    Where-Object { $_.DirectoryName -notmatch "node_modules|\.git" } |
    Select-String -Pattern "AIza[a-zA-Z0-9_-]+" -ErrorAction SilentlyContinue

if ($apiKeys) {
    Write-Host "⚠️  WARNING: Found potential API keys in source code!" -ForegroundColor Yellow
    Write-Host "   Check these files:" -ForegroundColor Yellow
    $apiKeys | Select-Object -First 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    $hasErrors = $true
} else {
    Write-Host "✅ No hardcoded Gemini API keys found" -ForegroundColor Green
}

Write-Host ""

# Check .gitignore
Write-Host "3. Verifying .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -match "\.env\*" -and $gitignoreContent -match "backend/\.env") {
    Write-Host "✅ .gitignore properly configured" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: .gitignore missing .env patterns" -ForegroundColor Red
    $hasErrors = $true
}

Write-Host ""

# Check for .env.example
Write-Host "4. Checking for .env.example files..." -ForegroundColor Yellow
if ((Test-Path ".env.example") -and (Test-Path "backend/.env.example")) {
    Write-Host "✅ .env.example files exist" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: Missing .env.example files" -ForegroundColor Yellow
}

Write-Host ""

# Check if .env files exist locally
Write-Host "5. Checking for local .env files..." -ForegroundColor Yellow
if ((Test-Path ".env") -and (Test-Path "backend/.env")) {
    Write-Host "✅ Local .env files exist" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: Missing local .env files (needed for development)" -ForegroundColor Yellow
}

Write-Host ""

if ($hasErrors) {
    Write-Host "Security check failed! Fix the errors above before deploying." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Security check complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review any warnings above" -ForegroundColor White
Write-Host "2. Ensure all API keys are in .env files" -ForegroundColor White
Write-Host "3. Never commit .env files to git" -ForegroundColor White
Write-Host "4. Use environment variables in your hosting platform" -ForegroundColor White
