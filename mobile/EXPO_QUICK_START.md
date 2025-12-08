# Expo Quick Start Guide

## How Expo Works

**Expo doesn't open a mobile app directly on your computer.** Instead, it:

1. Starts a development server (like a local web server)
2. Shows you a QR code
3. You scan the QR code with your **phone** using the **Expo Go** app
4. The app runs on your actual phone, not on your computer

## Step-by-Step Setup

### Step 1: Install Expo Go on Your Phone

**For Android:**
- Go to Google Play Store
- Search for "Expo Go"
- Install it

**For iOS:**
- Go to App Store
- Search for "Expo Go"
- Install it

### Step 2: Make Sure Your Phone and Computer are on the Same WiFi Network

Both devices must be connected to the same WiFi network.

### Step 3: Start the Expo Server

```bash
cd mobile
npm start
```

After running `npm start`, you'll see:
- A QR code in the terminal
- Options to press `i` (iOS) or `a` (Android) for emulators
- Or you can scan the QR code with Expo Go app

### Step 4: Connect Your Phone

**Option A: Scan QR Code (Recommended)**
1. Open Expo Go app on your phone
2. Tap "Scan QR code"
3. Scan the QR code from the terminal
4. The app will load on your phone

**Option B: Use Emulator (If you have Android Studio or Xcode)**
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

## Troubleshooting

### Error: ENOENT: no such file or directory
**Solution:** 
1. Delete `.expo` folder: `rmdir /s /q .expo` (Windows) or `rm -rf .expo` (Mac/Linux)
2. Run `npm install` again
3. Try `npm start` again

### Can't Connect Phone
- Make sure phone and computer are on same WiFi
- Try "tunnel" mode: `expo start --tunnel`
- Check firewall isn't blocking the connection

### App Shows "Network Request Failed"
- Check API URL in `src/config/api.ts`
- Make sure backend is running and accessible

## What You'll See

When `npm start` works correctly:
- Terminal shows: "Metro waiting on..."
- QR code appears
- You can scan it with Expo Go
- App opens on your phone showing the Login screen

## Alternative: Use Web Version (Testing Only)

You can test on your computer browser:
```bash
npm start
# Then press 'w' for web
```

But for full mobile experience, use Expo Go on your phone!

