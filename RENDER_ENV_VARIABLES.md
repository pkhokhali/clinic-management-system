# 🔐 Render Environment Variables Setup

Copy and paste these environment variables into your Render dashboard.

## 📋 Environment Variables for Render

When deploying your backend to Render, add these environment variables:

### 1. MongoDB Connection String

```
MONGODB_URI=mongodb+srv://prabin:YOUR_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority
```

**⚠️ IMPORTANT:** Replace `YOUR_PASSWORD` with your actual MongoDB Atlas password!

### 2. Server Configuration

```
PORT=10000
NODE_ENV=production
```

### 3. JWT Configuration

Generate a strong JWT secret (32+ characters):

```
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_for_production_security
JWT_EXPIRE=7d
```

**Generate JWT Secret:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use online generator: https://generate-secret.vercel.app/32

### 4. Frontend URL

After deploying to Vercel, update this with your Vercel URL:

```
FRONTEND_URL=https://your-app-name.vercel.app
```

### 5. Email Configuration (Optional - configure later)

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=Clinic Management
```

### 6. SMS Configuration (Optional - configure later)

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 7. Payment Gateways (Optional - configure later)

```
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
FONEPAY_MERCHANT_ID=your_fonepay_merchant_id
FONEPAY_SECRET_KEY=your_fonepay_secret_key
```

---

## 🚀 Quick Setup Steps

1. **Copy the MongoDB URI** (replace password first!)
2. **Generate JWT_SECRET** using the command above
3. **Add all variables** to Render dashboard
4. **Update FRONTEND_URL** after Vercel deployment

---

## ✅ Minimum Required Variables

For basic functionality, you only need:

1. `MONGODB_URI` - Your MongoDB connection string
2. `JWT_SECRET` - Strong secret key
3. `NODE_ENV=production`
4. `PORT=10000` (optional, Render sets this automatically)

Everything else can be added later!
