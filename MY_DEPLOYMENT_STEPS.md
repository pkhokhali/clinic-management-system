# 🚀 Your Deployment Steps

Quick reference for deploying with your MongoDB connection string.

## 📋 Your MongoDB Connection String

**Original:**
```
mongodb+srv://prabin:<db_password>@cluster0.8uds5sw.mongodb.net/?appName=Cluster0
```

**✅ Formatted for Render (replace YOUR_PASSWORD):**
```
mongodb+srv://prabin:YOUR_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Format MongoDB Connection String

1. Replace `<db_password>` with your actual MongoDB Atlas password
2. Add database name: `clinic_management`
3. Final format:
   ```
   mongodb+srv://prabin:YOUR_ACTUAL_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority
   ```

### Step 2: Generate JWT Secret

Run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the generated secret.

### Step 3: Deploy Backend to Render

1. Go to: https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect GitHub: `pkhokhali/clinic-management-system`
4. Settings:
   - **Name:** `clinic-management-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. **Add Environment Variables:**

   ```env
   MONGODB_URI=mongodb+srv://prabin:YOUR_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority
   
   JWT_SECRET=paste_your_generated_secret_here
   
   JWT_EXPIRE=7d
   
   NODE_ENV=production
   
   FRONTEND_URL=https://your-app.vercel.app
   ```
   
   **⚠️ Remember:** Replace `YOUR_PASSWORD` with your actual password!

6. Click "Create Web Service"
7. Wait for deployment (3-5 minutes)
8. Copy your backend URL (e.g., `https://clinic-management-backend.onrender.com`)

### Step 4: Deploy Frontend to Vercel

1. Go to: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import: `pkhokhali/clinic-management-system`
4. Settings:
   - **Framework:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `.next` (auto)

5. **Add Environment Variable:**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api`
     (Replace with your actual Render backend URL + `/api`)

6. Click "Deploy"
7. Wait for build (2-3 minutes)
8. Copy your frontend URL (e.g., `https://clinic-management-system.vercel.app`)

### Step 5: Update Frontend URL in Render

1. Go back to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your Vercel URL
5. Render will auto-redeploy

---

## ✅ Test Your Deployment

1. **Backend Health Check:**
   ```
   https://your-backend.onrender.com/api/health
   ```
   Should return: `{"success":true,"message":"Server is running"}`

2. **Frontend:**
   Visit your Vercel URL and test:
   - User registration
   - Login
   - API connectivity

---

## 📝 Quick Checklist

- [ ] MongoDB connection string formatted with password
- [ ] JWT_SECRET generated
- [ ] Backend deployed to Render
- [ ] All environment variables added to Render
- [ ] Frontend deployed to Vercel
- [ ] NEXT_PUBLIC_API_URL set in Vercel
- [ ] FRONTEND_URL updated in Render
- [ ] Tested health check endpoint
- [ ] Tested frontend-backend connection

---

## 🔗 Your URLs

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com`
- **API:** `https://your-backend.onrender.com/api`
- **Health Check:** `https://your-backend.onrender.com/api/health`

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions!
