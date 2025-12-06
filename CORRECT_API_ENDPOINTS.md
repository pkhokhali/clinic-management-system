# ✅ Correct API Endpoints

## 🔴 Wrong URL (What You Tried):
```
https://clinic-management-backend-2fuj.onrender.com/api/login
```
❌ This doesn't exist → "Route not found"

---

## ✅ Correct URL (What You Need):
```
https://clinic-management-backend-2fuj.onrender.com/api/auth/login
```

---

## 📋 All Correct Endpoints

### Authentication
- **Login:** `POST /api/auth/login`
- **Register:** `POST /api/auth/register`
- **Get Current User:** `GET /api/auth/me` (requires token)
- **Forgot Password:** `POST /api/auth/forgotpassword`
- **Reset Password:** `PUT /api/auth/resetpassword/:token`
- **Update Password:** `PUT /api/auth/updatepassword` (requires token)

### Health Check
- **Health:** `GET /api/health`

### Other Endpoints
- **Appointments:** `/api/appointments/*`
- **Medical Records:** `/api/medical/*`
- **Lab:** `/api/lab/*`
- **Invoices:** `/api/invoices/*`
- **Inventory:** `/api/inventory/*`
- **Analytics:** `/api/analytics/*`
- **Users:** `/api/users/*`

---

## 🧪 Test Login Endpoint

### Using Browser Console:
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
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Using curl:
```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "Admin@123"
  }'
```

### Using PowerShell:
```powershell
$body = @{
    email = "admin@clinic.com"
    password = "Admin@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://clinic-management-backend-2fuj.onrender.com/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## ✅ Correct Full URLs

### Backend Base URL:
```
https://clinic-management-backend-2fuj.onrender.com
```

### API Base URL (for frontend):
```
https://clinic-management-backend-2fuj.onrender.com/api
```

### Health Check:
```
https://clinic-management-backend-2fuj.onrender.com/api/health
```

### Login:
```
https://clinic-management-backend-2fuj.onrender.com/api/auth/login
```

---

## 🔍 Why the Error?

You tried: `/api/login`  
But the route is: `/api/auth/login`

The auth routes are grouped under `/api/auth/*`, so all authentication endpoints have `/auth` in the path.

---

**Use `/api/auth/login` and it will work!** ✅
