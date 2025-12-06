# 🔧 Fix: Cannot Connect to Server

The error "Cannot connect to server" means your frontend can't reach the backend. This is because the API URL is not configured in Vercel.

---

## ✅ Quick Fix: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Sign in
3. Find and click on your **clinic-management-system** project

### Step 2: Add Environment Variable

1. Click on **"Settings"** tab (top menu)
2. Click on **"Environment Variables"** (left sidebar)
3. Click **"Add New"** button

### Step 3: Add the Variable

**Key:**
```
NEXT_PUBLIC_API_URL
```

**Value:**
```
https://clinic-management-backend-2fuj.onrender.com/api
```

⚠️ **Important:**
- Must start with `https://`
- Must end with `/api`
- No trailing slash after `/api`

### Step 4: Select Environments

Check all three:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 5: Save and Redeploy

1. Click **"Save"**
2. Go to **"Deployments"** tab
3. Click the **three dots (⋯)** on the latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete (2-3 minutes)

---

## 🧪 Test After Redeploy

1. Visit your Vercel frontend URL
2. Open browser console (F12)
3. Go to Console tab
4. Type this and press Enter:
   ```javascript
   console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET');
   ```
5. Should show: `https://clinic-management-backend-2fuj.onrender.com/api`

---

## ✅ Verify Backend is Running

Before fixing frontend, verify backend works:

1. Open in browser:
   ```
   https://clinic-management-backend-2fuj.onrender.com/api/health
   ```

2. Should see:
   ```json
   {"success":true,"message":"Server is running","timestamp":"..."}
   ```

If this doesn't work → Backend is down (check Render dashboard)

---

## 📋 Step-by-Step Checklist

Follow these steps:

- [ ] Go to Vercel Dashboard
- [ ] Click your project
- [ ] Go to Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_API_URL` = `https://clinic-management-backend-2fuj.onrender.com/api`
- [ ] Select all environments (Production, Preview, Development)
- [ ] Save
- [ ] Redeploy frontend
- [ ] Wait for deployment to complete
- [ ] Test login again

---

## 🔍 Verify It's Fixed

After redeploying, test login again:

1. Open your frontend
2. Try to login
3. Check browser console (F12 → Console)
4. Should NOT see "Cannot connect to server" error

If you still see the error:
- Check if backend health endpoint works
- Verify the environment variable was saved correctly
- Make sure frontend was redeployed after adding the variable

---

## 💡 Why This Happened

Next.js requires environment variables that start with `NEXT_PUBLIC_` to be set in Vercel. Without it:
- Frontend defaults to `http://localhost:5000/api` (localhost)
- This won't work in production
- Frontend can't reach the backend

Setting `NEXT_PUBLIC_API_URL` in Vercel fixes this!

---

**After setting the variable and redeploying, login should work!** 🎉
