# Desktop App Setup Guide

## Quick Start

1. **Navigate to desktop directory:**
   ```bash
   cd desktop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   
   Update `src/renderer/src/config/api.ts` with your backend URL:
   ```typescript
   const API_BASE_URL = 'https://clinic-management-backend-2fuj.onrender.com/api';
   ```
   
   Or set environment variable:
   ```bash
   # Windows (PowerShell)
   $env:REACT_APP_API_URL="https://clinic-management-backend-2fuj.onrender.com/api"
   
   # Linux/Mac
   export REACT_APP_API_URL="https://clinic-management-backend-2fuj.onrender.com/api"
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

## Installing Dependencies

If you encounter issues during `npm install`, try:

```bash
npm install --legacy-peer-deps
```

## Creating App Icons

For production builds, you'll need icon files:

### Windows (.ico)
- Create `assets/icon.ico` (256x256 recommended)

### macOS (.icns)
- Create `assets/icon.icns` (1024x1024 recommended)

### Linux (.png)
- Create `assets/icon.png` (512x512 recommended)

You can use online tools like:
- https://convertio.co/png-ico/
- https://cloudconvert.com/png-to-icns

For now, the app will work without icons, but they're needed for packaged releases.

## Building for Production

### Development Build:
```bash
npm run build
```

### Create Installers:

**Windows (creates .exe installer):**
```bash
npm run package:win
```

**macOS (creates .dmg):**
```bash
npm run package:mac
```

**Linux (creates .AppImage):**
```bash
npm run package:linux
```

Installer files will be in the `release/` directory.

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
- Change port in `vite.config.ts`:
  ```typescript
  server: {
    port: 3001, // or any available port
  },
  ```

### Build Errors
- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Electron Not Opening
- Make sure all dependencies are installed
- Check console for errors
- Verify API URL is correct

## Features Currently Implemented

✅ Basic Electron setup
✅ React + TypeScript
✅ Material-UI theming
✅ Authentication (Login/Logout)
✅ Dashboard page
✅ Navigation layout
✅ API integration
✅ Protected routes

## Next Steps to Expand

1. Add patient management pages
2. Add appointment scheduling
3. Add medical records management
4. Add laboratory management
5. Add billing/invoicing
6. Add reports and analytics
7. Implement offline storage
8. Add system tray support

