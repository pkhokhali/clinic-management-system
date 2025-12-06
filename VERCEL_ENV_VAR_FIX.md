# 🔧 Fix Vercel Environment Variable Error

## Issue
```
Environment Variable "NEXT_PUBLIC_API_URL" references Secret "next_public_api_url", which does not exist.
```

## Cause
The `vercel.json` file was trying to reference a Vercel secret that doesn't exist.

## ✅ Solution
Fixed! Removed the secret reference from `vercel.json`. Now you just need to set the environment variable in Vercel dashboard.

---

## 🚀 Steps to Deploy Frontend

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**

### Step 2: Import Repository
1. Search for: `clinic-management-system`
2. Click **"Import"**

### Step 3: Configure Project
- **Project Name:** `clinic-management-system`
- **Framework:** Next.js (auto-detected)
- **Root Directory:** Click "Edit" → Set to `frontend` ⚠️ **IMPORTANT!**
- **Build Command:** `npm run build` (auto)
- **Output Directory:** `.next` (auto)

### Step 4: Add Environment Variable
**BEFORE clicking Deploy**, add environment variable:

1. Scroll down to **"Environment Variables"** section
2. Click to expand it
3. Click **"Add"** or **"Add Another"**
4. Enter:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://clinic-management-backend-2fuj.onrender.com/api`
   - **Environment:** Production, Preview, Development (check all)
5. Click **"Add"**

### Step 5: Deploy!
1. Click **"Deploy"** button
2. Wait for build (2-3 minutes)
3. Watch build logs

### Step 6: Get Your Frontend URL
1. Once deployed, copy your Vercel URL
2. Example: `https://clinic-management-system.vercel.app`
3. **Save this URL!**

---

## ✅ What Was Fixed

- ✅ Removed secret reference from `vercel.json`
- ✅ Now uses standard Vercel environment variables
- ✅ Set `NEXT_PUBLIC_API_URL` in Vercel dashboard instead

---

## 📋 Environment Variable

**Key:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://clinic-management-backend-2fuj.onrender.com/api`

Make sure it ends with `/api`!

---

**The fix has been pushed to GitHub. Try deploying again!** 🚀
