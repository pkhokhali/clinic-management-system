# 🧪 Quick Backend Test

## Test 1: Backend Health (30 seconds)

**Open this URL in your browser:**
```
https://clinic-management-backend-2fuj.onrender.com/api/health
```

**What you should see:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-XX..."
}
```

**If you see this:**
✅ Backend is running!  
❌ If it takes 30-60 seconds, backend was sleeping (normal for free tier)  
❌ If it fails, backend is down - check Render dashboard

---

## Test 2: Backend Root (30 seconds)

**Open this URL:**
```
https://clinic-management-backend-2fuj.onrender.com
```

**What you should see:**
```json
{
  "success": true,
  "message": "Welcome to Clinic Management System API",
  ...
}
```

**If you see this:**
✅ Backend is working!  
❌ If it fails, backend has issues

---

## Test 3: Login API (Browser Console)

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
  console.log('✅ Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('✅ Response:', data);
  if (data.success) {
    console.log('🎉 LOGIN WORKS!');
  } else {
    console.log('❌ Login failed:', data.message);
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
  console.log('This means the backend is not reachable');
});
```

4. Press Enter
5. Check the console output

**What to look for:**
- ✅ `Status: 200` = Connection works!
- ✅ `Status: 401` = Connection works, but credentials wrong
- ❌ `Network Error` = Cannot reach backend
- ❌ `CORS Error` = CORS configuration issue

---

## 📊 Results:

| Test | Result | Meaning |
|------|--------|---------|
| Health endpoint works | ✅ | Backend is running |
| Health endpoint slow (30-60s) | ⚠️ | Backend was sleeping, now awake |
| Health endpoint fails | ❌ | Backend is down - check Render |
| Login returns 401 | ✅ | Backend works, credentials wrong |
| Login returns Network Error | ❌ | Cannot connect - check CORS/network |
| Login returns CORS Error | ❌ | CORS configuration issue |

---

## 🎯 Quick Fix:

**If backend is sleeping:**
1. Visit health endpoint first
2. Wait 30-60 seconds for response
3. Immediately try login again

**If CORS error:**
1. Go to Render Dashboard
2. Add `FRONTEND_URL` environment variable
3. Value: Your Vercel frontend URL
4. Redeploy

**If backend is down:**
1. Check Render dashboard
2. Look at logs for errors
3. Verify service is "Live"

---

**Run these tests and share the results!** 🔍
