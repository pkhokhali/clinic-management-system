# Mobile App Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Expo CLI**: `npm install -g expo-cli`
4. **Expo Go app** on your mobile device (iOS or Android)

## Installation Steps

1. **Navigate to mobile directory:**
```bash
cd mobile
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API URL:**
   - Open `src/config/api.ts`
   - Update `API_BASE_URL` with your backend URL:
   ```typescript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   ```

4. **Start the development server:**
```bash
npm start
```

5. **Run on device:**
   - Scan the QR code with Expo Go app (iOS) or Camera app (Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
mobile/
├── src/
│   ├── config/          # API configuration
│   ├── context/         # React Context (Auth, etc.)
│   ├── screens/         # Screen components
│   │   ├── Patient/     # Patient-specific screens
│   │   ├── Doctor/      # Doctor-specific screens
│   │   └── Admin/       # Admin-specific screens
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   └── types/           # TypeScript types
├── assets/              # Images, fonts, etc.
├── App.tsx              # Root component
└── package.json         # Dependencies
```

## Environment Variables

Create a `.env` file in the `mobile` directory:

```
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
```

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Features Implemented

✅ Authentication (Login)
✅ Patient Dashboard
✅ Navigation Structure
✅ API Integration
✅ TypeScript Support

## Next Steps

1. Add more screens (Appointments, Medical Records, etc.)
2. Implement push notifications
3. Add offline support
4. Create doctor and admin screens
5. Add image uploads
6. Implement biometric authentication

## Troubleshooting

### Common Issues

1. **Metro bundler errors:**
   - Clear cache: `expo start -c`

2. **API connection issues:**
   - Check backend URL in `src/config/api.ts`
   - Ensure backend CORS allows mobile app origin

3. **Build errors:**
   - Delete `node_modules` and reinstall
   - Clear Expo cache

