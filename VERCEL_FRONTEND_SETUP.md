# 🚀 Frontend Deployment to Vercel

Your backend is live! Now let's deploy the frontend.

## ✅ Backend Status

**Backend URL:** `https://clinic-management-backend-2fuj.onrender.com`  
**API URL:** `https://clinic-management-backend-2fuj.onrender.com/api`  
**Health Check:** `https://clinic-management-backend-2fuj.onrender.com/api/health`

---

## 🚀 Deploy Frontend to Vercel (10 minutes)

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Sign in (or create account if needed)
3. Click **"Add New..."** → **"Project"**

### Step 2: Import Repository
1. Search for: `clinic-management-system`
2. Click **"Import"** next to your repository

### Step 3: Configure Project

**Important Settings:**
- **Project Name:** `clinic-management-system` (or your choice)
- **Framework Preset:** `Next.js` (should auto-detect)
- **Root Directory:** Click "Edit" → Set to `frontend` ⚠️ **VERY IMPORTANT!**
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)

### Step 4: Add Environment Variable
Click "Environment Variables" section and add:

**Key:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://clinic-management-backend-2fuj.onrender.com/api`

⚠️ **Copy this exactly:**
```
NEXT_PUBLIC_API_URL=https://clinic-management-backend-2fuj.onrender.com/api
```

### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Watch the build logs

### Step 6: Get Your Frontend URL
1. Once deployed, you'll see "Congratulations!"
2. Copy the URL (e.g., `https://clinic-management-system.vercel.app`)
3. **Save this URL!** You'll need it for the next step

---

## 🔄 Update Frontend URL in Render (2 minutes)

After deploying to Vercel, update Render:

### Step 1: Go Back to Render
1. Open Render dashboard: https://dashboard.render.com/
2. Click on your backend service: `clinic-management-backend-2fuj`

### Step 2: Update Environment Variable
1. Go to "Environment" tab
2. Find `FRONTEND_URL`
3. Click "Edit"
4. Replace value with your Vercel URL:
   ```
   https://your-frontend-url.vercel.app
   ```
   (Replace with your actual Vercel frontend URL)
5. Click "Save Changes"
6. Render will auto-redeploy (wait 2-3 minutes)

---

## ✅ Test Your Deployment

### Test Backend:
Visit: `https://clinic-management-backend-2fuj.onrender.com/api/health`

Should see:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

### Test Frontend:
1. Visit your Vercel URL
2. Try to register a user
3. Try to login
4. Check browser console for errors

---

## 🎉 Success Checklist

- [x] Backend deployed to Render ✅
- [ ] Frontend deployed to Vercel
- [ ] NEXT_PUBLIC_API_URL set in Vercel
- [ ] FRONTEND_URL updated in Render
- [ ] Can access frontend
- [ ] Can register/login users
- [ ] API calls working

---

## 🔧 Troubleshooting

### Frontend can't reach backend:
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches: `https://clinic-management-backend-2fuj.onrender.com/api`
- Make sure it ends with `/api`
- Check browser console for CORS errors

### CORS errors:
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check Render logs after updating FRONTEND_URL

---

**Ready? Let's deploy the frontend!** 🚀
