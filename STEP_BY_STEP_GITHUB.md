# Step-by-Step: Push to GitHub

## ✅ Step 1: Create Repository on GitHub

1. **Open your browser** and go to: 
   ```
   https://github.com/new
   ```

2. **Fill in the form:**
   - Repository name: `clinic-management-system`
   - Description: `Full-featured clinic management solution built with MERN Stack`
   - Choose **Public** or **Private**
   - **DO NOT CHECK ANY BOXES** (no README, no .gitignore, no license)
   
3. Click the green **"Create repository"** button

## ✅ Step 2: Push Your Code

Once the repository is created, you have two options:

### Option A: Use the PowerShell Script (Easiest)

Just run:
```powershell
.\push-with-token.ps1
```

### Option B: Manual Push

Run this command:
```bash
git push https://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@github.com/pkhokhali/clinic-management-system.git main
```

### Option C: Use Git Credential Helper (Recommended for Future)

This way you only enter the token once:

```powershell
# Configure credential helper
git config --global credential.helper wincred

# Push (you'll be prompted for credentials)
git push -u origin main
```

When prompted:
- **Username:** `pkhokhali`
- **Password:** `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`

## ✅ Step 3: Verify

After pushing, visit:
```
https://github.com/pkhokhali/clinic-management-system
```

You should see all your files there!

---

## 🔒 Security Note

Your token is currently in the script. After successful push, consider:
1. Revoking this token and creating a new one
2. Using Git Credential Manager for secure storage
3. Not committing tokens to git

---

## Need Help?

If you get errors:
- **"Repository not found"** → Make sure you created it on GitHub first
- **"Authentication failed"** → Check your token is correct
- **"Permission denied"** → Make sure token has `repo` scope
