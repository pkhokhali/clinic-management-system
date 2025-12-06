# 🔧 Fix Login Issue - Step by Step

## Why Login is Failing

Most common reasons:
1. ❌ **Admin account doesn't exist yet** (Most likely!)
2. ❌ Backend not connected to MongoDB
3. ❌ Frontend API URL not configured
4. ❌ CORS issue

---

## ✅ Step 1: Create Admin Account FIRST

**You must create an admin account before you can login!**

### Quick Method - Using API:

Open a terminal or use Postman/curl:

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

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

---

## ✅ Step 2: Test Backend is Working

Visit in browser:
```
https://clinic-management-backend-2fuj.onrender.com/api/health
```

Should see:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

---

## ✅ Step 3: Test Login Directly via API

After creating admin, test login:

```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "Admin@123"
  }'
```

**If this works, backend is fine. If not, check:**
- Backend logs in Render
- MongoDB connection

---

## ✅ Step 4: Check Frontend Configuration

### Verify API URL in Vercel:
1. Go to Vercel dashboard
2. Click your frontend project
3. Settings → Environment Variables
4. Check `NEXT_PUBLIC_API_URL` = `https://clinic-management-backend-2fuj.onrender.com/api`

---

## ✅ Step 5: Check Browser Console

1. Open frontend in browser
2. Press `F12` → Console tab
3. Try to login
4. Look for error messages

**Common errors:**
- `Network Error` → Backend not reachable
- `404` → Wrong API URL
- `401` → Invalid credentials or account doesn't exist

---

## 📋 Default Admin Credentials

**Email:** `admin@clinic.com`  
**Password:** `Admin@123`

⚠️ **Account must be created first!**

---

## 🎯 Quick Fix Steps

1. **Create admin account** (use curl command above)
2. **Test backend health** (visit health endpoint)
3. **Test login via API** (use curl command)
4. **Verify frontend API URL** (check Vercel env vars)
5. **Try login in frontend**

---

**Most likely issue: Admin account doesn't exist. Create it first using the API call above!**
