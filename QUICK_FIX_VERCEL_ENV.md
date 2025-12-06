# ⚡ Quick Fix: Set API URL in Vercel

## The Problem
Frontend shows: "Cannot connect to server"  
**Reason:** `NEXT_PUBLIC_API_URL` is not set in Vercel

---

## ✅ The Fix (5 Minutes)

### Step 1: Vercel Dashboard
```
1. Go to: https://vercel.com/dashboard
2. Click your project: clinic-management-system
```

### Step 2: Add Environment Variable
```
1. Click "Settings" tab
2. Click "Environment Variables" (left sidebar)
3. Click "Add New"
```

### Step 3: Enter Values
```
Key:   NEXT_PUBLIC_API_URL
Value: https://clinic-management-backend-2fuj.onrender.com/api
```

✅ Check all environments: Production, Preview, Development

### Step 4: Save & Redeploy
```
1. Click "Save"
2. Go to "Deployments" tab
3. Click "⋯" (three dots) on latest deployment
4. Click "Redeploy"
5. Wait 2-3 minutes
```

---

## ✅ Verify It Works

1. Visit your Vercel frontend URL
2. Try to login
3. Should work now! ✅

---

## 🧪 Test Backend First

Before fixing frontend, verify backend works:

Open in browser:
```
https://clinic-management-backend-2fuj.onrender.com/api/health
```

Should see:
```json
{"success":true,"message":"Server is running"}
```

If this doesn't work → Check Render dashboard, backend might be down.

---

**That's it! After redeploying, login should work!** 🎉
