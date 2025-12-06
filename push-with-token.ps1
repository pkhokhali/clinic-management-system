# PowerShell script to push code to GitHub using your token
# Run this AFTER creating the repository on GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Push Clinic Management System" -ForegroundColor Cyan
Write-Host "  to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Your GitHub token
$token = "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"
$username = "pkhokhali"
$repo = "clinic-management-system"

Write-Host "Repository: $username/$repo" -ForegroundColor Yellow
Write-Host ""

# Check if repository exists
Write-Host "Attempting to push to GitHub..." -ForegroundColor Yellow
Write-Host ""

try {
    $remoteUrl = "https://${token}@github.com/${username}/${repo}.git"
    git push $remoteUrl main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Success! Your code has been pushed to GitHub!" -ForegroundColor Green
        Write-Host "Repository URL: https://github.com/$username/$repo" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Push failed. Please check:" -ForegroundColor Red
        Write-Host "   1. Repository exists at: https://github.com/$username/$repo" -ForegroundColor Yellow
        Write-Host "   2. Token has correct permissions" -ForegroundColor Yellow
        Write-Host "   3. Repository name matches exactly: $repo" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you've created the repository first at:" -ForegroundColor Yellow
    Write-Host "https://github.com/new" -ForegroundColor Cyan
}
