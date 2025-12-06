# 🚀 Deploy Now - Step-by-Step Guide

Follow these steps to deploy your Clinic Management System.

## 📋 Prerequisites Checklist

- [x] GitHub repository ready
- [x] MongoDB connection string ready
- [x] JWT secret generated
- [ ] Render account
- [ ] Vercel account

---

## Part 1: Deploy Backend to Render (15 minutes)

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com/
2. Sign in (or create account if needed)
3. Click "New +" button (top right)
4. Select **"Web Service"**

### Step 2: Connect GitHub Repository
1. If not connected, click "Connect GitHub" and authorize
2. Search for: `clinic-management-system`
3. Click "Connect" next to your repository

### Step 3: Configure Service
Fill in these settings:

- **Name:** `clinic-management-backend`
- **Environment:** `Node`
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ **IMPORTANT!**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### Step 4: Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add these one by one:

**1. MongoDB Connection:**
```
Key: MONGODB_URI
Value: mongodb+srv://prabin:ktmlifecare2025@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority
```

**2. JWT Secret:**
```
Key: JWT_SECRET
Value: mQlytS1dTrDOq6KBta+4zlB7H72yIgdUlbGhWo28RJs=
```

**3. JWT Expire:**
```
Key: JWT_EXPIRE
Value: 7d
```

**4. Node Environment:**
```
Key: NODE_ENV
Value: production
```

**5. Frontend URL (temporary, update later):**
```
Key: FRONTEND_URL
Value: https://placeholder.vercel.app
```

### Step 5: Deploy!
1. Scroll down
2. Click **"Create Web Service"**
3. Wait for deployment (3-5 minutes)
4. Watch the build logs

### Step 6: Get Your Backend URL
1. Once deployed, you'll see: "Your service is live"
2. Copy the URL (e.g., `https://clinic-management-backend.onrender.com`)
3. **Save this URL!** You'll need it for Vercel

### Step 7: Test Backend
Visit: `https://your-backend-url.onrender.com/api/health`

Should see:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

✅ **Backend deployed!**

---

## Part 2: Deploy Frontend to Vercel (10 minutes)

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Sign in (or create account if needed)
3. Click **"Add New..."** → **"Project"**

### Step 2: Import Repository
1. Search for: `clinic-management-system`
2. Click **"Import"** next to your repository

### Step 3: Configure Project
- **Project Name:** `clinic-management-system` (or your choice)
- **Framework Preset:** `Next.js` (should auto-detect)
- **Root Directory:** Click "Edit" → Set to `frontend` ⚠️ **IMPORTANT!**
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)

### Step 4: Add Environment Variable
Click "Environment Variables" section

Add:
```
Key: NEXT_PUBLIC_API_URL
Value: https://your-backend-url.onrender.com/api
```
⚠️ Replace `your-backend-url` with your actual Render backend URL!

### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Watch the build logs

### Step 6: Get Your Frontend URL
1. Once deployed, you'll see "Congratulations!"
2. Copy the URL (e.g., `https://clinic-management-system.vercel.app`)
3. **Save this URL!**

✅ **Frontend deployed!**

---

## Part 3: Update Frontend URL in Render (2 minutes)

### Step 1: Go Back to Render
1. Open Render dashboard
2. Click on your backend service

### Step 2: Update Environment Variable
1. Go to "Environment" tab
2. Find `FRONTEND_URL`
3. Click "Edit"
4. Replace value with your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
5. Click "Save Changes"
6. Render will auto-redeploy (wait 2-3 minutes)

---

## ✅ Test Your Deployment

### Test Backend:
```
https://your-backend.onrender.com/api/health
```
Expected: `{"success":true,"message":"Server is running"}`

### Test Frontend:
Visit your Vercel URL and:
1. Try to register a user
2. Try to login
3. Check browser console for errors

---

## 🎉 Success Checklist

- [ ] Backend deployed to Render
- [ ] Backend health check works
- [ ] Frontend deployed to Vercel
- [ ] Frontend URL updated in Render
- [ ] Can access frontend
- [ ] Can register/login users
- [ ] API calls working

---

## 🔧 Troubleshooting

### Backend not connecting to MongoDB:
- Check Render logs for connection errors
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Double-check connection string in Render environment variables

### Frontend can't reach backend:
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render backend URL
- Make sure it ends with `/api`
- Check browser console for CORS errors

### Build fails:
- Check build logs in Render/Vercel
- Verify root directory is set correctly
- Check for missing dependencies

---

## 📞 Need Help?

- Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting
- Review Render/Vercel logs
- Check GitHub repository: https://github.com/pkhokhali/clinic-management-system

---

**Ready? Let's deploy! Start with Part 1 above.** 🚀
