# 🔍 Debug Login Issue - Step by Step

Let's systematically debug why login is failing.

---

## Step 1: Check Frontend API URL Configuration

The frontend needs to know where the backend is located.

### In Vercel:
1. Go to Vercel Dashboard
2. Click your frontend project
3. Go to **Settings** → **Environment Variables**
4. Check if `NEXT_PUBLIC_API_URL` is set to:
   ```
   https://clinic-management-backend-2fuj.onrender.com/api
   ```
   ⚠️ **Note the `/api` at the end!**

5. If it's missing or wrong:
   - Add/Update the variable
   - **Redeploy** the frontend

### Check if variable is loaded:
Open browser console on your frontend and run:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

---

## Step 2: Test Backend Directly

Open this URL in your browser:
```
https://clinic-management-backend-2fuj.onrender.com/api/health
```

**Should see:** `{"success":true,"message":"Server is running",...}`

If this doesn't work → Backend is down or wrong URL

---

## Step 3: Test Login API Directly

### Using Browser Console:
Open your frontend in browser, press F12, go to Console tab, paste:

```javascript
fetch('https://clinic-management-backend-2fuj.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@clinic.com',
    password: 'Admin@123'
  })
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ LOGIN SUCCESS!');
  } else {
    console.log('❌ LOGIN FAILED:', data.message);
  }
})
.catch(err => {
  console.error('❌ ERROR:', err);
});
```

**Share what you see in console!**

---

## Step 4: Check Browser Network Tab

1. Open frontend in browser
2. Press `F12` → **Network** tab
3. Clear network log (trash icon)
4. Try to login
5. Find the `/auth/login` request
6. Click on it and check:

**Request:**
- URL: Should be `https://clinic-management-backend-2fuj.onrender.com/api/auth/login`
- Method: POST
- Payload: Should show email and password

**Response:**
- Status Code: What number? (200, 401, 400, 500, etc.)
- Response Body: What does it say?

**Share:**
- Status Code
- Response message

---

## Step 5: Check MongoDB User

1. Go to MongoDB Atlas
2. Browse Collections → `users`
3. Find your user (search by email)
4. Check these fields:

**Email:**
- Should be: `admin@clinic.com` (lowercase)

**Password:**
- Should start with: `$2a$`, `$2b$`, or `$2y$`
- If it's plain text → That's the problem!

**isActive:**
- Should be: `true`

**Role:**
- Should be one of: `Super Admin`, `Admin`, etc.

---

## Step 6: Check Backend Logs

1. Go to Render Dashboard
2. Click your backend service
3. Go to **Logs** tab
4. Try to login from frontend
5. Check logs for errors

**Look for:**
- MongoDB connection errors
- Authentication errors
- Password comparison errors
- Any error messages

---

## Step 7: Common Issues & Fixes

### Issue 1: "Network Error" or CORS Error
**Fix:** Check CORS configuration in backend
- Backend should allow your Vercel frontend URL

### Issue 2: "Invalid credentials"
**Possible causes:**
- Password is plain text (not hashed)
- Wrong email/password
- Email case mismatch

**Fix:** Recreate user via API

### Issue 3: Status 500 (Server Error)
**Fix:** Check backend logs for specific error

### Issue 4: Frontend not connecting to backend
**Fix:** 
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Redeploy frontend

---

## 📋 Quick Checklist

Run through these:

- [ ] Backend health endpoint works
- [ ] Frontend API URL is configured in Vercel
- [ ] Frontend has been redeployed after setting API URL
- [ ] User exists in MongoDB
- [ ] Password in MongoDB is hashed (starts with `$2`)
- [ ] Email in MongoDB is lowercase
- [ ] User isActive is `true`
- [ ] Browser console shows specific error
- [ ] Network tab shows request/response

---

## 🎯 What to Share

To help debug, please share:

1. **Browser Console Error** (F12 → Console tab)
2. **Network Tab Response** (F12 → Network → /auth/login request)
3. **MongoDB Password Format** (does it start with `$2`?)
4. **Backend Logs** (any errors when trying to login)

---

**Let's go through these steps and identify the exact issue!**
