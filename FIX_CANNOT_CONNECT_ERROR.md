# 🔧 Fix "Cannot connect to server" Error

## 🔴 The Problem:

You're seeing this error on login:
```
Cannot connect to server. Please check your internet connection and ensure the backend is running.
```

This means your frontend (Vercel) cannot reach your backend (Render).

---

## ✅ The Solution:

The `NEXT_PUBLIC_API_URL` environment variable is **missing or incorrect** in your Vercel project.

---

## 📋 Step-by-Step Fix:

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Find your project: `clinic-management-system` (or your project name)
3. Click on it

### Step 2: Open Settings

1. Click on **"Settings"** tab (top menu)
2. Click on **"Environment Variables"** (left sidebar)

### Step 3: Add the Environment Variable

1. Click **"Add New"** button
2. Fill in:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://clinic-management-backend-2fuj.onrender.com/api`
   - **Environment:** Select **Production**, **Preview**, and **Development** (or just **Production**)

⚠️ **IMPORTANT:** 
- The value MUST end with `/api` (NOT `/api/auth` or just the domain)
- No trailing slash after `/api`

### Step 4: Save and Redeploy

1. Click **"Save"**
2. Go to **"Deployments"** tab
3. Click the **three dots** (⋯) on the latest deployment
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to complete

---

## ✅ Correct Configuration:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://clinic-management-backend-2fuj.onrender.com/api` |

---

## 🔍 How to Verify:

### Option 1: Check Browser Console

1. Open your deployed frontend website
2. Press `F12` → Console tab
3. You should see logs showing the API URL being used
4. Try logging in again

### Option 2: Check Network Tab

1. Open your deployed frontend website
2. Press `F12` → Network tab
3. Try to login
4. Look for a request to `/auth/login`
5. Check the full URL - it should be: `https://clinic-management-backend-2fuj.onrender.com/api/auth/login`

---

## 🧪 Test the Backend Directly:

Before fixing Vercel, test if backend is accessible:

1. Open browser
2. Visit: `https://clinic-management-backend-2fuj.onrender.com/api/health`
3. You should see: `{"success": true, "message": "Server is running", ...}`

If this doesn't work, your backend has issues (not the frontend).

---

## 📝 Quick Checklist:

- [ ] Backend is accessible at: `https://clinic-management-backend-2fuj.onrender.com/api/health`
- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] Value is exactly: `https://clinic-management-backend-2fuj.onrender.com/api`
- [ ] Environment variable is set for **Production** environment
- [ ] Frontend has been redeployed after adding the variable

---

## 🎯 After Fixing:

1. Wait for Vercel to finish redeploying (2-3 minutes)
2. Refresh your frontend website
3. Try logging in again
4. The error should be gone!

---

## 💡 Common Mistakes:

❌ **Wrong:** `https://clinic-management-backend-2fuj.onrender.com`  
✅ **Correct:** `https://clinic-management-backend-2fuj.onrender.com/api`

❌ **Wrong:** `https://clinic-management-backend-2fuj.onrender.com/api/`  
✅ **Correct:** `https://clinic-management-backend-2fuj.onrender.com/api`

❌ **Wrong:** Variable name is `API_URL` (missing `NEXT_PUBLIC_`)  
✅ **Correct:** Variable name is `NEXT_PUBLIC_API_URL`

---

**Follow these steps and the error will be fixed!** 🚀
