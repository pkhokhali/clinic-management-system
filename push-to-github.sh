#!/bin/bash
# Bash script to push to GitHub
# Run this after creating your GitHub repository

echo "Clinic Management System - GitHub Push Script"
echo "============================================="
echo ""

# Prompt for GitHub repository URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/pkhokhali/clinic-management-system.git): " repoUrl

if [ -z "$repoUrl" ]; then
    echo "Repository URL is required!"
    exit 1
fi

# Add remote
echo "Adding remote repository..."
git remote add origin "$repoUrl"

# Verify remote
echo "Verifying remote..."
git remote -v

# Rename branch to main
echo "Renaming branch to main..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
echo "You may be prompted for GitHub credentials."
git push -u origin main

echo ""
echo "Done! Your code has been pushed to GitHub."
echo "Repository: $repoUrl"
