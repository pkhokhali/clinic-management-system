# PowerShell script to push to GitHub
# Run this after creating your GitHub repository

Write-Host "Clinic Management System - GitHub Push Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Prompt for GitHub repository URL
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/pkhokhali/clinic-management-system.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "Repository URL is required!" -ForegroundColor Red
    exit
}

# Add remote
Write-Host "Adding remote repository..." -ForegroundColor Yellow
git remote add origin $repoUrl

# Verify remote
Write-Host "Verifying remote..." -ForegroundColor Yellow
git remote -v

# Rename branch to main
Write-Host "Renaming branch to main..." -ForegroundColor Yellow
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "Done! Your code has been pushed to GitHub." -ForegroundColor Green
Write-Host "Repository: $repoUrl" -ForegroundColor Cyan
