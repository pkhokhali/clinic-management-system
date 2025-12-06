# 🔧 Fix MongoDB Connection - Step by Step

## Current Error
```
❌ Error connecting to MongoDB: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

This means the MongoDB connection string is either:
- ❌ Not set in Render
- ❌ Set incorrectly
- ❌ MongoDB Atlas network access not configured

---

## ✅ Step-by-Step Fix

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com/
2. Sign in
3. Click on your backend service: `clinic-management-backend-2fuj`

### Step 2: Check Environment Variables
1. Click **"Environment"** tab (on the left sidebar)
2. Look for `MONGODB_URI` in the list

**If MONGODB_URI is missing:**
- Click **"Add Environment Variable"** button
- Continue to Step 3

**If MONGODB_URI exists:**
- Check if the value is correct
- If wrong, click **"Edit"** and update

### Step 3: Add MONGODB_URI

Click **"Add Environment Variable"** and enter:

**Key:**
```
MONGODB_URI
```

**Value:**
```
mongodb+srv://prabinkhokhali89_db_user:gWH0EDUvYHkL0XA3@clinic-management.5g7gvf7.mongodb.net/clinic_management?retryWrites=true&w=majority
```

⚠️ **Copy the entire value above - make sure there are NO spaces!**

Click **"Save Changes"**

### Step 4: Verify Other Required Variables

Make sure these also exist:

✅ `JWT_SECRET` = `mQlytS1dTrDOq6KBta+4zlB7H72yIgdUlbGhWo28RJs=`
✅ `NODE_ENV` = `production`
✅ `JWT_EXPIRE` = `7d`

### Step 5: Check MongoDB Atlas Network Access

1. Go to: https://cloud.mongodb.com/
2. Sign in
3. Click **"Network Access"** (left sidebar)
4. Check if you see `0.0.0.0/0` (Allow Access from Anywhere)

**If not present:**
1. Click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"**
3. Click **"Confirm"**

This allows Render to connect to MongoDB.

### Step 6: Wait for Auto-Redeploy

After saving environment variables:
- Render will automatically redeploy (2-3 minutes)
- Watch the logs to see if connection succeeds

### Step 7: Check Logs

After redeploy, you should see:
```
Attempting to connect to MongoDB...
Connection string: mongodb+srv://prabinkhokhali89_db_user:****@clinic-management.5g7gvf7.mongodb.net/...
✅ MongoDB Connected: clinic-management-shard-00-00.xxxxx.mongodb.net
✅ Database: clinic_management
Server running on port 10000 in production mode
```

---

## 🔍 Troubleshooting

### Still seeing connection error?

1. **Double-check connection string format:**
   - Should start with `mongodb+srv://`
   - Should include `/clinic_management` before `?`
   - No spaces anywhere

2. **Verify MongoDB Atlas:**
   - Go to MongoDB Atlas
   - Database Access → Check username exists
   - Network Access → Should have `0.0.0.0/0`

3. **Check Render logs:**
   - Look for the "Connection string:" log
   - Verify it shows the correct host

---

## 📋 Quick Checklist

- [ ] MONGODB_URI exists in Render environment variables
- [ ] Connection string is exactly as shown above
- [ ] MongoDB Atlas Network Access has `0.0.0.0/0`
- [ ] All other required env vars are set
- [ ] Render has auto-redeployed
- [ ] Check logs for connection success

---

**After fixing, your backend should connect successfully!** 🚀
