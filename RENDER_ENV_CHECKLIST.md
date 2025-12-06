# ✅ Render Environment Variables Checklist

## Required Environment Variables

Make sure these are set in your Render dashboard:

### 1. MONGODB_URI ⚠️ REQUIRED
```
mongodb+srv://prabinkhokhali89_db_user:gWH0EDUvYHkL0XA3@clinic-management.5g7gvf7.mongodb.net/clinic_management?retryWrites=true&w=majority
```

### 2. JWT_SECRET ⚠️ REQUIRED
```
mQlytS1dTrDOq6KBta+4zlB7H72yIgdUlbGhWo28RJs=
```

### 3. JWT_EXPIRE
```
7d
```

### 4. NODE_ENV
```
production
```

### 5. PORT (Optional - Render sets this automatically)
```
10000
```

### 6. FRONTEND_URL (Update after Vercel deployment)
```
https://your-app.vercel.app
```

---

## How to Add Environment Variables in Render

1. Go to: https://dashboard.render.com/
2. Click on your backend service: `clinic-management-backend-2fuj`
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Enter Key and Value
6. Click **"Save Changes"**
7. Render will auto-redeploy

---

## Verify Your MongoDB Connection String

Your connection string should be exactly:
```
mongodb+srv://prabinkhokhali89_db_user:gWH0EDUvYHkL0XA3@clinic-management.5g7gvf7.mongodb.net/clinic_management?retryWrites=true&w=majority
```

**Check:**
- ✅ Starts with `mongodb+srv://`
- ✅ Username: `prabinkhokhali89_db_user`
- ✅ Password: `gWH0EDUvYHkL0XA3`
- ✅ Host: `clinic-management.5g7gvf7.mongodb.net`
- ✅ Database: `/clinic_management`
- ✅ Options: `?retryWrites=true&w=majority`

---

## Common Issues

### Issue: "ENOTFOUND" error
**Solution:** Check MongoDB Atlas network access - add `0.0.0.0/0`

### Issue: "Authentication failed"
**Solution:** Verify username and password in connection string

### Issue: Connection string not found
**Solution:** MONGODB_URI environment variable is not set in Render

---

**After adding/updating variables, Render will auto-redeploy!** 🚀
