# 👤 Admin Account Credentials

## Default Admin Login

After creating the admin account, use these credentials:

### 📧 Login Credentials

**Email:** `admin@clinic.com`  
**Password:** `Admin@123`  
**Role:** `Super Admin`

⚠️ **SECURITY:** Change this password immediately after first login!

---

## 🚀 How to Create Admin Account

### Method 1: Using Script (Recommended)

#### For Local Development:
```bash
cd backend
node scripts/createAdmin.js
```

#### For Production (Render):
1. Go to Render dashboard
2. Click on your backend service
3. Click **"Shell"** tab
4. Run:
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

### Method 2: Using API Registration

Use the registration API endpoint:

**URL:** `https://clinic-management-backend-2fuj.onrender.com/api/auth/register`

**Method:** `POST`

**Body:**
```json
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@clinic.com",
  "phone": "9800000000",
  "password": "Admin@123",
  "role": "Super Admin"
}
```

**Using curl:**
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

---

## 📋 Default Admin Details

| Field | Value |
|-------|-------|
| **Email** | `admin@clinic.com` |
| **Password** | `Admin@123` |
| **Role** | `Super Admin` |
| **Full Name** | Super Admin |
| **Phone** | 9800000000 |

---

## ✅ After Creating Admin

1. **Login** to your frontend application
2. **Change Password** immediately (Settings/Profile)
3. **Create Additional Users** as needed
4. **Configure System** settings

---

## 🔒 Security Best Practices

1. ✅ Change default password immediately
2. ✅ Use strong passwords (min 8 characters)
3. ✅ Create separate admin accounts for team members
4. ✅ Don't share the super admin account
5. ✅ Enable two-factor authentication (if available)

---

## 🎯 Quick Start

1. Run: `cd backend && node scripts/createAdmin.js`
2. Login with: `admin@clinic.com` / `Admin@123`
3. Change password immediately

---

**Ready to create your admin account!** 🚀
