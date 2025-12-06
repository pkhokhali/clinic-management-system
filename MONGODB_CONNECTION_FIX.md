# 🔧 MongoDB Connection Fix

## Issue
Backend is starting but failing to connect to MongoDB:
```
Error connecting to MongoDB: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

## Likely Causes
1. **MONGODB_URI not set in Render** - Most common issue
2. **Incorrect connection string format**
3. **MongoDB Atlas IP whitelist** - Render IPs not allowed
4. **Wrong password** in connection string

## ✅ Solution Steps

### Step 1: Verify MongoDB Connection String in Render

1. Go to Render dashboard: https://dashboard.render.com/
2. Click on your backend service: `clinic-management-backend-2fuj`
3. Go to **"Environment"** tab
4. Check if `MONGODB_URI` exists

### Step 2: Add/Update MONGODB_URI

If missing or incorrect, add/update:

**Key:** `MONGODB_URI`

**Value:**
```
mongodb+srv://prabinkhokhali89_db_user:gWH0EDUvYHkL0XA3@clinic-management.5g7gvf7.mongodb.net/clinic_management?retryWrites=true&w=majority
```

⚠️ **IMPORTANT:** 
- Copy the entire string above
- Make sure there are no spaces
- Make sure password is correct

### Step 3: Check MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Go to **"Network Access"** in left sidebar
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
5. Click **"Confirm"**

This allows Render servers to connect.

### Step 4: Verify MongoDB User Credentials

1. Go to MongoDB Atlas
2. Go to **"Database Access"** in left sidebar
3. Verify:
   - Username: `prabinkhokhali89_db_user`
   - Password: `gWH0EDUvYHkL0XA3` (is this correct?)

If password is wrong, either:
- Reset the password in MongoDB Atlas
- Update the connection string in Render

### Step 5: Redeploy

After updating environment variables:
1. Render will auto-redeploy (wait 2-3 minutes)
2. Or manually trigger: "Manual Deploy" → "Deploy latest commit"

## ✅ Expected Result

After fixing, you should see in Render logs:
```
Attempting to connect to MongoDB...
✅ MongoDB Connected: clinic-management-shard-00-00.xxxxx.mongodb.net
Server running on port 10000 in production mode
```

## 🔍 Verify Connection String Format

Your connection string should be:
```
mongodb+srv://USERNAME:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://prabinkhokhali89_db_user:gWH0EDUvYHkL0XA3@clinic-management.5g7gvf7.mongodb.net/clinic_management?retryWrites=true&w=majority
```

## 📋 Checklist

- [ ] `MONGODB_URI` is set in Render environment variables
- [ ] Connection string format is correct (mongodb+srv://...)
- [ ] Password in connection string matches MongoDB Atlas
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0` (or Render IPs)
- [ ] Username in connection string is correct
- [ ] Database name is included (`/clinic_management`)

---

**After updating, Render will auto-redeploy. Check the logs to verify connection!** 🚀
