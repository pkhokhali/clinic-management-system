# Quick Push to GitHub

Your repository is configured! To push using your GitHub token:

## Option 1: Push with Token in URL (Quick)

Run this command (replace YOUR_TOKEN with your actual token):

```bash
git push https://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@github.com/pkhokhali/clinic-management-system.git main
```

## Option 2: Use Token as Password (Recommended)

When prompted for credentials:
- Username: `pkhokhali`
- Password: `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`

Just run:
```bash
git push -u origin main
```

## Option 3: Configure Git Credential Helper (For Future)

To avoid entering the token each time:

```bash
git config --global credential.helper wincred
git push -u origin main
```

Then enter:
- Username: `pkhokhali`
- Password: `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`

**Note:** Make sure you've created the repository on GitHub first at: https://github.com/new
Repository name should be: `clinic-management-system`
