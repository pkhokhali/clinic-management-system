# 🧪 Quick Login Test

Test your login functionality step by step.

## Step 1: Check Backend Health

Open in browser or use curl:
```
https://clinic-management-backend-2fuj.onrender.com/api/health
```

**Should return:** `{"success":true,"message":"Server is running",...}`

---

## Step 2: Create Admin Account

### Using API:
```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@clinic.com",
    "phone": "9800000000",
    "password": "Admin@123",
    "role": "Super Admin"
  }'
```

---

## Step 3: Test Login

### Using API:
```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "Admin@123"
  }'
```

**Expected:** Should return user data and token.

---

## Step 4: Login via Frontend

1. Go to your Vercel frontend URL
2. Use credentials:
   - Email: `admin@clinic.com`
   - Password: `Admin@123`

---

## Common Issues

- **Backend not running** → Check Render logs
- **MongoDB not connected** → Check MONGODB_URI in Render
- **Admin not created** → Run createAdmin script
- **Wrong API URL** → Check NEXT_PUBLIC_API_URL in Vercel
- **CORS error** → Check FRONTEND_URL in Render
