# ⚡ Quick Fix for Login Issue

Since the user exists in MongoDB but login fails, here's the quickest fix:

---

## 🔍 Most Common Problem

**If the user was created directly in MongoDB (manually):**
- The password is likely stored in **plain text**
- Password needs to be **hashed** (bcrypt) for login to work

---

## ✅ Quick Fix: Reset Password via API

Since we can't directly hash an existing plain-text password, the easiest fix is to **reset the password**:

### Step 1: Delete the existing user from MongoDB

Or better yet, use the API to create a properly formatted user:

### Step 2: Recreate User via API (Recommended)

This ensures password is properly hashed:

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

**Note:** If user already exists, you'll get an error. In that case:

### Option A: Delete user from MongoDB first, then recreate

### Option B: Update existing user's password via MongoDB

1. Go to MongoDB Atlas
2. Find your user
3. Delete the user document
4. Then recreate via API above

---

## 🔧 Alternative: Check What's Wrong

### Use the Diagnostic Script

If you have local access, run:

```bash
node backend/scripts/checkUserPassword.js admin@clinic.com
```

This will tell you:
- ✅ If password is hashed
- ✅ If user exists
- ✅ What the issue is

---

## 📋 Step-by-Step Fix

1. **Check MongoDB:**
   - Open MongoDB Atlas
   - Go to your `users` collection
   - Find your user
   - Check the `password` field:
     - ✅ Should start with `$2a$`, `$2b$`, or `$2y$` (hashed)
     - ❌ If it's plain text → That's the problem!

2. **If password is plain text:**
   - Delete the user from MongoDB
   - Recreate via API (see command above)

3. **Try login again:**
   - Email: `admin@clinic.com`
   - Password: `Admin@123`

---

## 🎯 Most Likely Solution

**Delete the manually created user and recreate via API:**

1. MongoDB Atlas → Collections → users
2. Delete the user document
3. Create new user via API (command above)
4. Login with the new credentials

---

## 💡 Why This Happens

When you create a user:
- ✅ **Via API** → Password is automatically hashed by Mongoose pre-save hook
- ❌ **Manually in MongoDB** → Password is stored as plain text

Login requires hashed password, so manually created users can't login.

---

**The backend will auto-redeploy with the improved error handling. After deployment, try login again and check the browser console for the specific error message!**
