# 🚀 URGENT: Set Environment Variable in Vercel NOW

## 🔴 Current Problem:

Your frontend shows: **"Cannot connect to server"** because the API URL is not configured in Vercel.

---

## ✅ Quick Fix (5 minutes):

### Step 1: Open Vercel Dashboard
👉 https://vercel.com/dashboard

### Step 2: Select Your Project
- Find **"clinic-management-system"** (or your project name)
- Click on it

### Step 3: Go to Settings
- Click **"Settings"** tab (top menu)
- Click **"Environment Variables"** (left sidebar)

### Step 4: Add Environment Variable
Click **"Add New"** and enter:

```
Key:   NEXT_PUBLIC_API_URL
Value: https://clinic-management-backend-2fuj.onrender.com/api
```

⚠️ **IMPORTANT:**
- Key must be exactly: `NEXT_PUBLIC_API_URL` (case-sensitive)
- Value must be exactly: `https://clinic-management-backend-2fuj.onrender.com/api`
- NO trailing slash
- MUST include `/api` at the end

### Step 5: Select Environments
- ✅ Check **Production**
- ✅ Check **Preview** 
- ✅ Check **Development** (optional)

### Step 6: Save
- Click **"Save"** button

### Step 7: Redeploy
- Go to **"Deployments"** tab
- Click **three dots** (⋯) on latest deployment
- Click **"Redeploy"**
- Wait 2-3 minutes

---

## ✅ Verify It's Working:

1. Wait for deployment to complete (check Vercel dashboard)
2. Open your frontend website
3. Press `F12` → Console tab
4. Try logging in
5. Check console - you should see:
   - ✅ No "Cannot connect" error
   - ✅ Login request to: `https://clinic-management-backend-2fuj.onrender.com/api/auth/login`

---

## 📸 Visual Guide:

### What You Should See in Vercel:

```
Environment Variables

┌─────────────────────────────────────────┐
│ Key                      │ Value        │
├─────────────────────────────────────────┤
│ NEXT_PUBLIC_API_URL      │ https://...  │
└─────────────────────────────────────────┘

Environment: Production ✓ Preview ✓ Development ✓
```

---

## 🎯 Expected Result:

**Before:**
```
❌ Cannot connect to server...
```

**After:**
```
✅ Login successful! (or proper error message from backend)
```

---

## 💡 Why This Happens:

- Your frontend code uses: `process.env.NEXT_PUBLIC_API_URL`
- If not set, it defaults to: `http://localhost:5000/api`
- In production, `localhost` doesn't work!
- You need to tell Vercel where your backend is

---

## ⏱️ Time to Fix: **5 minutes**

**Do this now and your login will work!** 🚀
