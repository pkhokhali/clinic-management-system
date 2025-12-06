# 🔍 Diagnose Login Issue - Step by Step

The user exists in MongoDB but login is failing. Let's diagnose the issue.

---

## 🔴 Common Causes:

1. **Password not hashed** - If user was created manually in MongoDB
2. **Email case mismatch** - Email might have different case
3. **Password comparison failing** - Password format issue
4. **Backend not receiving request** - Network/CORS issue

---

## ✅ Step 1: Check User in MongoDB

### Option A: Use Diagnostic Script

Run this script to check the user's password status:

```bash
cd backend
node scripts/checkUserPassword.js admin@clinic.com Admin@123
```

This will show:
- ✅ If user exists
- ✅ If password is hashed
- ✅ If password matches

### Option B: Check MongoDB Directly

1. Go to MongoDB Atlas → Browse Collections
2. Find your user in the `users` collection
3. Check:
   - `email` field (should be lowercase)
   - `password` field (should start with `$2a$`, `$2b$`, or `$2y$` if hashed)

**If password doesn't start with `$2`:**
- Password is NOT hashed
- User was created manually in MongoDB
- Password needs to be reset

---

## ✅ Step 2: Test Login via API Directly

Use curl or Postman to test login:

```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "YourPassword"
  }'
```

**Check the response:**
- Status 401 = Wrong credentials
- Status 500 = Server error (check backend logs)

---

## ✅ Step 3: Check Browser Console

1. Open frontend in browser
2. Press `F12` → **Network** tab
3. Try to login
4. Find the `/auth/login` request
5. Check:
   - **Status Code**: What HTTP status?
   - **Response**: What error message?
   - **Request URL**: Is it correct?

---

## ✅ Step 4: Check Backend Logs

1. Go to Render dashboard
2. Click your backend service
3. Go to **Logs** tab
4. Try to login
5. Look for error messages in logs

---

## 🔧 Fixes Based on Issue:

### Issue 1: Password Not Hashed

If password in MongoDB is plain text (doesn't start with `$2`):

**Solution:** Reset password via API:

```bash
curl -X PUT https://clinic-management-backend-2fuj.onrender.com/api/auth/resetpassword/YOUR_RESET_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewPassword123"
  }'
```

Or delete the user and recreate via API:

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

### Issue 2: Email Case Mismatch

The login now normalizes email to lowercase. Make sure:
- Email in MongoDB is lowercase
- You're using lowercase email to login

### Issue 3: Network Error

If you see "Network Error" in browser console:
- Backend might be down
- CORS issue
- Wrong API URL in frontend

Check:
- Backend health: `https://clinic-management-backend-2fuj.onrender.com/api/health`
- Frontend API URL in Vercel environment variables

---

## 📋 Quick Diagnostic Checklist

- [ ] User exists in MongoDB?
- [ ] Password field exists and is not empty?
- [ ] Password is hashed (starts with `$2`)?
- [ ] Email is lowercase in MongoDB?
- [ ] Backend is running (check health endpoint)?
- [ ] Frontend API URL is correct?
- [ ] No CORS errors in browser console?
- [ ] Backend logs show any errors?

---

## 🎯 Most Likely Fix

**If user was created manually in MongoDB:**

1. Delete the user from MongoDB (or update password)
2. Recreate user via API:

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

This ensures password is properly hashed.

---

**Need more help? Run the diagnostic script and share the output!**
