# KTM Life Care Clinic - Mobile App

React Native mobile application for KTM Life Care Clinic management system.

## Features

- **Patient Features:**
  - View appointments
  - Book appointments
  - View medical records
  - View lab test results
  - View prescriptions
  - View invoices and payments
  - Profile management

- **Doctor Features:**
  - View appointments
  - View assigned patients
  - View and create medical records
  - View lab results
  - Manage prescriptions

- **Admin/Staff Features:**
  - Dashboard
  - Patient management
  - Appointment management
  - Billing management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL in `src/config/api.ts`

3. Start the development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

5. Run on Android:
```bash
npm run android
```

## Environment Variables

Create a `.env` file in the root directory:

```
API_URL=https://your-backend-url.com/api
```

## Build

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

