# Create App Assets

The app needs image files for icons and splash screens. Here's how to create them:

## Quick Solution (Temporary)

You can create simple placeholder images or use online tools:

### Option 1: Use Online Generator (Recommended)
1. Go to https://www.appicon.co/ or https://appicon.build/
2. Upload any logo or create a simple one
3. Download the generated assets
4. Place them in the `mobile/assets/` folder

### Option 2: Create Simple Placeholders
1. Create a simple 1024x1024px PNG file named `icon.png`
2. Create a 1242x2436px PNG file named `splash.png`
3. Place both in `mobile/assets/` folder

### Option 3: Download Placeholder Images
Use placeholder.com or any image generator to create basic images.

## Required Files

- `assets/icon.png` - 1024x1024px (App icon)
- `assets/splash.png` - 1242x2436px (Splash screen)

## For Now

The app will work even without these files if you're just testing on your phone with Expo Go. The assets are mainly needed for:
- Building standalone apps
- Publishing to app stores
- Web version

For development/testing, you can continue without them!

