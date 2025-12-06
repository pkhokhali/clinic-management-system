# 🔧 Login Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "Login failed. Please try again."

This error can occur for several reasons. Let's check them one by one:

---

## ✅ Step 1: Verify Backend is Running

### Check Backend Health:
Visit: `https://clinic-management-backend-2fuj.onrender.com/api/health`

**Expected Response:**
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

**If this doesn't work:**
- Backend might not be running
- Check Render logs for errors
- Verify MongoDB connection is successful

---

## ✅ Step 2: Check Frontend API URL

### Verify Environment Variable:
1. Go to Vercel dashboard
2. Click your frontend project
3. Go to **Settings** → **Environment Variables**
4. Check `NEXT_PUBLIC_API_URL` is set to:
   ```
   https://clinic-management-backend-2fuj.onrender.com/api
   ```

**If missing or wrong:**
- Add/Update the variable
- Redeploy frontend

---

## ✅ Step 3: Create Admin Account

The admin account needs to be created first!

### Option A: Using Script (Recommended)

**In Render Shell:**
1. Go to Render dashboard
2. Click backend service → **Shell** tab
3. Run:
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

### Option B: Using API (Direct)

**Create Admin Account:**

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

## ✅ Step 4: Test Login with API

Test if login works directly via API:

```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "Admin@123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

**If this fails:**
- Admin account doesn't exist → Create it first
- Wrong credentials → Check email/password
- Backend error → Check Render logs

---

## ✅ Step 5: Check Browser Console

1. Open your frontend in browser
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to login
5. Look for errors

**Common Errors:**
- `Network Error` → Backend not reachable / CORS issue
- `404` → Wrong API URL
- `500` → Backend error
- `401` → Invalid credentials

---

## ✅ Step 6: Verify CORS Configuration

Backend CORS should allow your Vercel frontend URL:

1. Go to Render dashboard
2. Check `FRONTEND_URL` environment variable
3. Should match your Vercel URL exactly

---

## 🔍 Quick Diagnosis

### Test Backend:
```bash
curl https://clinic-management-backend-2fuj.onrender.com/api/health
```

### Test Login API:
```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"Admin@123"}'
```

### Check Browser Network Tab:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try login
4. Check the `/auth/login` request
   - Status code
   - Response body
   - Request URL

---

## 📋 Default Admin Credentials

**Email:** `admin@clinic.com`  
**Password:** `Admin@123`

⚠️ **Make sure admin account is created first!**

---

## 🎯 Step-by-Step Fix

1. ✅ Create admin account (use script or API)
2. ✅ Verify backend is running (check health endpoint)
3. ✅ Verify frontend API URL is correct
4. ✅ Test login via API first
5. ✅ Check browser console for errors
6. ✅ Verify CORS settings

---

**Need more help? Check the error message in browser console for specific details!**
