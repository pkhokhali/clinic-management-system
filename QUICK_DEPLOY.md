# ⚡ Quick Deployment Checklist

Use this checklist for fast deployment to Vercel and Render.

## ✅ Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and connection string ready
- [ ] Strong JWT_SECRET generated
- [ ] Vercel account ready
- [ ] Render account ready

---

## 🗄️ MongoDB Atlas (5 minutes)

1. [Create Atlas Account](https://www.mongodb.com/cloud/atlas/register)
2. Create Free (M0) cluster
3. Create database user (save password!)
4. Add IP: `0.0.0.0/0` (allow all)
5. Get connection string (replace `<password>` and save)

---

## 🚀 Render Backend (10 minutes)

### Create Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. New → Web Service
3. Connect GitHub repo: `pkhokhali/clinic-management-system`
4. Settings:
   - **Root Directory:** `backend`
   - **Build:** `npm install`
   - **Start:** `npm start`

### Environment Variables
Add these in Render dashboard:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/clinic_management?retryWrites=true&w=majority
JWT_SECRET=generate_strong_secret_min_32_chars
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.vercel.app (update after Vercel)
NODE_ENV=production
```

5. Deploy and copy backend URL

---

## ⚛️ Vercel Frontend (5 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Add New → Project
3. Import: `pkhokhali/clinic-management-system`
4. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto)

### Environment Variable
Add in Vercel:
- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://your-backend.onrender.com/api`

5. Deploy and copy frontend URL

---

## 🔄 Final Step

Update `FRONTEND_URL` in Render with your Vercel URL

---

## 🎯 Your URLs

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com/api`
- Health Check: `https://your-backend.onrender.com/api/health`

---

## 🔑 Generate JWT Secret

Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use online generator: https://generate-secret.vercel.app/32

---

**Total Time: ~20 minutes** ⏱️
