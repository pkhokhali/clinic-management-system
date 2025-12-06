# 👤 Create Admin Account

## Default Admin Credentials

After creating the admin account, use these credentials:

**Email:** `admin@clinic.com`  
**Password:** `admin123`  
**Role:** `Super Admin`

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## 🔧 Method 1: Using Script (Recommended)

### Step 1: Run the Admin Creation Script

**For Local Development:**
```bash
cd backend
node scripts/createAdmin.js
```

**For Production (Render):**
The script can be run via Render's shell or you can create the admin through the API.

### Step 2: Login
1. Go to your frontend URL
2. Login with:
   - Email: `admin@clinic.com`
   - Password: `admin123`

---

## 🔧 Method 2: Using API (After Deployment)

### Create Admin via API Request

After your backend is deployed, you can create an admin using the registration endpoint:

**Request:**
```bash
POST https://your-backend.onrender.com/api/auth/register
Content-Type: application/json

{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@clinic.com",
  "phone": "9800000000",
  "password": "admin123",
  "role": "Super Admin"
}
```

**Using curl:**
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@clinic.com",
    "phone": "9800000000",
    "password": "admin123",
    "role": "Super Admin"
  }'
```

---

## 🔧 Method 3: Using MongoDB Directly

### Option A: MongoDB Compass
1. Connect to your MongoDB Atlas cluster
2. Navigate to `clinic_management` database
3. Go to `users` collection
4. Click "Insert Document"
5. Insert this document (password will be hashed automatically if using the API):

```json
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@clinic.com",
  "phone": "9800000000",
  "password": "admin123",
  "role": "Super Admin",
  "isActive": true,
  "isEmailVerified": true
}
```

⚠️ **Note:** If inserting directly, password won't be hashed. Use API or script instead.

### Option B: MongoDB Shell
Connect to your MongoDB and run:
```javascript
use clinic_management

// Password will be hashed by the User model if you use User.create()
// For direct insert, you'd need to hash the password first
```

---

## 🚀 Quick Setup Script

I've created a script at `backend/scripts/createAdmin.js` that you can run:

### Local:
```bash
cd backend
node scripts/createAdmin.js
```

### Render (via Shell):
1. Go to Render dashboard
2. Click on your backend service
3. Click "Shell" tab
4. Run:
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

---

## 📋 Admin Account Details

| Field | Value |
|-------|-------|
| **Email** | `admin@clinic.com` |
| **Password** | `admin123` |
| **Role** | `Super Admin` |
| **Full Name** | Super Admin |
| **Phone** | 9800000000 |

---

## 🔒 Security Notes

1. **Change Password Immediately**
   - After first login, change the password
   - Go to Settings/Profile → Change Password

2. **Create Additional Admins**
   - Create separate admin accounts for different people
   - Don't share the super admin account

3. **Strong Passwords**
   - Use strong, unique passwords
   - At least 8 characters
   - Mix of letters, numbers, and symbols

---

## ✅ After Creating Admin

1. Login to the application
2. Change the default password
3. Create additional users as needed
4. Configure clinic settings

---

**Default Admin Credentials:**
- Email: `admin@clinic.com`
- Password: `admin123`
