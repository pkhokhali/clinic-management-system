# ⚙️ Vercel Environment Variable Setup

## Required Environment Variable

Your frontend needs to know where the backend is located.

### Variable Details:

**Key:** `NEXT_PUBLIC_API_URL`

**Value:** `https://clinic-management-backend-2fuj.onrender.com/api`

---

## How to Set in Vercel

### Method 1: Via Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select Your Project**
   - Click on `clinic-management-system`

3. **Navigate to Settings**
   - Click "Settings" tab (top menu)
   - Click "Environment Variables" (left sidebar)

4. **Add Variable**
   - Click "Add New"
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://clinic-management-backend-2fuj.onrender.com/api`
   - Select all environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

5. **Redeploy**
   - Go to "Deployments" tab
   - Click three dots (⋯) on latest deployment
   - Click "Redeploy"
   - Wait for completion

### Method 2: Via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_API_URL
# When prompted, enter: https://clinic-management-backend-2fuj.onrender.com/api
# Select all environments
```

Then redeploy:
```bash
vercel --prod
```

---

## Verify It's Set

After setting and redeploying:

1. Open your frontend in browser
2. Press F12 → Console tab
3. Run:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL);
   ```
4. Should output: `https://clinic-management-backend-2fuj.onrender.com/api`

---

## Troubleshooting

### Variable not working after setting:
- ✅ Make sure you selected all environments
- ✅ Make sure you redeployed after setting
- ✅ Check variable name is exactly: `NEXT_PUBLIC_API_URL`
- ✅ Check value ends with `/api`

### Still getting "Cannot connect to server":
- Check backend is running: https://clinic-management-backend-2fuj.onrender.com/api/health
- Verify variable is set correctly in Vercel dashboard
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

**Once set and redeployed, the frontend will be able to connect to the backend!** ✅
