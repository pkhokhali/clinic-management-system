# How to Use the Mobile App

## ✅ Expo Server is Running Successfully!

You can see the QR code in your terminal. Now follow these steps:

## Step 1: Install Expo Go on Your Phone

### For Android:
1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install the app (by Expo)

### For iOS:
1. Open **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Install the app (by Expo)

## Step 2: Connect to Same WiFi

**Important:** Your phone and computer must be on the **same WiFi network**.

- Make sure both are connected to the same WiFi
- If using mobile data, it won't work

## Step 3: Scan the QR Code

### For Android:
1. Open **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Point your camera at the QR code in the terminal
4. The app will load automatically!

### For iOS:
1. Open **Camera** app on your iPhone
2. Point at the QR code in the terminal
3. Tap the notification that appears
4. It will open in **Expo Go** app

## Step 4: App Opens on Your Phone!

Once scanned, the app will:
- Download and bundle the code
- Show the **Login screen** on your phone
- You can now use the app!

## Alternative: Test in Browser

If you want to test on your computer first:
- Press **`w`** key in the terminal
- The app will open in your web browser
- Note: This is limited compared to mobile experience

## Troubleshooting

### Can't Scan QR Code?
- Make sure phone and computer are on same WiFi
- Try typing the URL manually: `exp://192.168.0.114:8081`
- Check if firewall is blocking connection

### Connection Failed?
- Try: `expo start --tunnel` (creates a tunnel through Expo servers)
- Or use: `expo start --localhost` for local testing

### Want to Stop the Server?
- Press **Ctrl + C** in the terminal

## What You'll See

After scanning, you should see:
1. **Login Screen** - Enter your clinic system credentials
2. **Patient Dashboard** - If logged in as patient
3. **Bottom Tabs** - Navigate between sections

The app is now running on your phone! 🎉

