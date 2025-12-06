# 🧪 Test the Correct Login Endpoint

## ✅ Correct Endpoint:

```
POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login
```

**Note:** It's `/api/auth/login`, NOT `/api/login`

---

## Test Methods:

### Method 1: Browser Console

1. Open your frontend website
2. Press `F12` → Console tab
3. Paste this:

```javascript
fetch('https://clinic-management-backend-2fuj.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@clinic.com',
    password: 'Admin@123'
  })
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ LOGIN SUCCESS!');
    console.log('User:', data.data.user);
    console.log('Token:', data.data.token.substring(0, 20) + '...');
  } else {
    console.log('❌ LOGIN FAILED:', data.message);
  }
})
.catch(err => {
  console.error('❌ ERROR:', err);
});
```

4. Press Enter
5. Check the response

---

### Method 2: Direct Browser URL (GET only)

You can't test POST in browser URL bar. Use Method 1 or Postman.

---

### Method 3: Postman

1. Open Postman
2. Method: **POST**
3. URL: `https://clinic-management-backend-2fuj.onrender.com/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "admin@clinic.com",
  "password": "Admin@123"
}
```
6. Click Send

---

## Expected Responses:

### ✅ Success (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "firstName": "Super",
      "lastName": "Admin",
      "email": "admin@clinic.com",
      "phone": "9800000000",
      "role": "Super Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### ❌ User Not Found (401):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### ❌ Wrong Password (401):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### ❌ Validation Error (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

---

## 🔍 If You Get "Route not found":

You're using the wrong URL. Make sure it's:
- ✅ `/api/auth/login` (correct)
- ❌ `/api/login` (wrong)

---

**Try the correct endpoint now!** 🚀
