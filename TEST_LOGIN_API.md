# 🧪 Test Login API Directly

Let's test the login endpoint directly to see what's happening.

## Step 1: Test Backend Health

Open in browser or use curl:
```
https://clinic-management-backend-2fuj.onrender.com/api/health
```

**Expected:** `{"success":true,"message":"Server is running",...}`

---

## Step 2: Test Login Endpoint

### Using Browser:
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Paste and run:

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
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
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

### Using curl:

```bash
curl -X POST https://clinic-management-backend-2fuj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@clinic.com\",\"password\":\"Admin@123\"}"
```

---

## Step 3: Check Response

**Look for:**
- ✅ Status 200 = Login successful
- ❌ Status 401 = Invalid credentials
- ❌ Status 400 = Validation error
- ❌ Status 500 = Server error

**Share the exact response you get!**

---

## Common Responses:

### Success Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

### Error Responses:

**User not found:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Wrong password:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Password not hashed:**
```json
{
  "success": false,
  "message": "Password format error. Please reset your password."
}
```

---

**Run the test above and share the response!**
