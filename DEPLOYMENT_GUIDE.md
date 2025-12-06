# 🚀 Deployment Guide - Vercel & Render

Complete guide to deploy your Clinic Management System to production.

## 📋 Prerequisites

- ✅ GitHub repository (already done!)
- ✅ Vercel account
- ✅ Render account
- ✅ MongoDB Atlas account (free tier available)

---

## Part 1: MongoDB Atlas Setup (Database)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Create a new organization (or use default)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select a cloud provider and region (choose closest to you)
4. Name your cluster (e.g., "clinic-management")
5. Click "Create"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and generate secure password (SAVE THIS!)
5. Set privileges to "Atlas admin" or "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist IP Address
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add specific IPs)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`)
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `clinic_management` (optional)
6. **SAVE THIS - You'll need it for Render!**

---

## Part 2: Deploy Backend to Render

### Step 1: Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select repository: `pkhokhali/clinic-management-system`
5. Configure service:
   - **Name:** `clinic-management-backend` (or your choice)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or upgrade if needed)

### Step 2: Add Environment Variables
Click "Environment" tab and add these variables:

```env
# Server Configuration
PORT=10000
NODE_ENV=production

# MongoDB - Use your Atlas connection string from Part 1
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic_management?retryWrites=true&w=majority

# JWT Configuration - Generate a strong secret
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_for_production
JWT_EXPIRE=7d

# Frontend URL - Will update after Vercel deployment
FRONTEND_URL=https://your-app-name.vercel.app

# Email Configuration (Optional - configure later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (Optional - configure later)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Payment Gateways (Optional - configure later)
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
FONEPAY_MERCHANT_ID=your_fonepay_merchant_id
FONEPAY_SECRET_KEY=your_fonepay_secret_key
```

**Important Notes:**
- Generate a strong `JWT_SECRET` (use: `openssl rand -base64 32` or online generator)
- `PORT` should be set to `10000` or use `process.env.PORT` (Render sets this automatically)
- `FRONTEND_URL` - Update this after Vercel deployment

### Step 3: Deploy
1. Click "Create Web Service"
2. Render will start building and deploying
3. Wait for deployment to complete (3-5 minutes)
4. Copy your backend URL (e.g., `https://clinic-management-backend.onrender.com`)

### Step 4: Update Backend for Render
Render uses port from `process.env.PORT`. Let's verify the server uses it:

✅ Your `server.js` already uses: `process.env.PORT || 5000` - Perfect!

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `pkhokhali/clinic-management-system`
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

### Step 2: Add Environment Variables
Before deploying, add environment variable:

- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://your-backend-url.onrender.com/api`
  - Replace with your actual Render backend URL from Part 2

### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Vercel will provide your frontend URL (e.g., `https://clinic-management-system.vercel.app`)

### Step 4: Update Backend FRONTEND_URL
1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable:
   - **New Value:** Your Vercel frontend URL (e.g., `https://clinic-management-system.vercel.app`)
3. Render will automatically redeploy

---

## Part 4: Final Configuration

### Update CORS in Backend
Your backend already has CORS configured to use `FRONTEND_URL` from environment variables. ✅

### Test Your Deployment

1. **Frontend:** Visit your Vercel URL
2. **Backend:** Test API health check:
   ```
   https://your-backend.onrender.com/api/health
   ```

### Verify Everything Works

1. Try registering a new user
2. Test login
3. Check if API calls work from frontend

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Backend not connecting to MongoDB
- ✅ Check MongoDB Atlas IP whitelist allows all (0.0.0.0/0)
- ✅ Verify connection string has correct password
- ✅ Check Render logs for error messages

**Problem:** Environment variables not working
- ✅ Make sure variable names match exactly (case-sensitive)
- ✅ Redeploy after adding new variables
- ✅ Check Render logs for errors

### Frontend Issues

**Problem:** Frontend can't connect to backend
- ✅ Check `NEXT_PUBLIC_API_URL` is correct in Vercel
- ✅ Verify backend URL includes `/api` at the end
- ✅ Check browser console for CORS errors

**Problem:** Build fails on Vercel
- ✅ Check build logs in Vercel dashboard
- ✅ Ensure all dependencies are in `package.json`
- ✅ Check for TypeScript errors

---

## 📝 Environment Variables Checklist

### Backend (Render) ✅
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong secret key
- [ ] `FRONTEND_URL` - Vercel frontend URL
- [ ] `PORT` - 10000 (or leave Render default)
- [ ] Email/SMS/Payment configs (optional)

### Frontend (Vercel) ✅
- [ ] `NEXT_PUBLIC_API_URL` - Render backend URL + `/api`

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:
- **Vercel:** Auto-deploys from `main` branch
- **Render:** Auto-deploys from `main` branch

Just push to GitHub and both will update automatically!

---

## 💰 Cost Estimate

- **MongoDB Atlas:** Free (M0 tier) - 512MB storage
- **Render:** Free tier - Spins down after 15min inactivity (wakes on request)
- **Vercel:** Free tier - Unlimited deployments

**Total Cost: $0/month** (perfect for development/staging!)

---

## 🎉 You're Live!

Your Clinic Management System is now deployed and accessible worldwide!

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com`

Happy coding! 🚀
