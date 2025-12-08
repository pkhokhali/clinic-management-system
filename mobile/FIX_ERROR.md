# Fix Expo Start Error

## The Error
```
Error: ENOENT: no such file or directory, mkdir 'D:\Clinic\mobile\.expo\metro\externals\node:sea'
```

## Solution

Run these commands **one by one** in PowerShell (from the `mobile` directory):

```powershell
# Step 1: Navigate to mobile directory
cd mobile

# Step 2: Delete .expo folder if it exists
if (Test-Path .expo) { Remove-Item -Recurse -Force .expo }

# Step 3: Install missing dependencies
npm install babel-plugin-module-resolver --save-dev

# Step 4: Clear npm cache
npm cache clean --force

# Step 5: Reinstall dependencies
npm install

# Step 6: Start Expo again
npm start
```

## How Expo Works

**Important:** Expo doesn't open a mobile app on your computer screen. Instead:

1. **Expo starts a development server** (like a web server)
2. **You see a QR code** in the terminal
3. **You install Expo Go app on your phone** (from App Store or Google Play)
4. **You scan the QR code** with Expo Go app
5. **The app opens on your phone**, not on your computer

### Quick Steps:

1. **Install Expo Go on your phone:**
   - Android: Google Play Store → "Expo Go"
   - iOS: App Store → "Expo Go"

2. **Make sure phone and computer are on same WiFi**

3. **Run `npm start`** in mobile directory

4. **Scan the QR code** with Expo Go app

5. **App will load on your phone!**

## Alternative: Test in Browser (Limited)

You can test the app in your computer browser:
```powershell
npm start
# Then press 'w' key
```

But for real mobile experience, use Expo Go on your phone!

