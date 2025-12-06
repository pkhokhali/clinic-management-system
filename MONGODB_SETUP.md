# 🗄️ MongoDB Atlas Connection Setup

Your MongoDB connection string has been configured! Here's how to use it.

## 🔗 Your Connection String

```
mongodb+srv://prabin:<db_password>@cluster0.8uds5sw.mongodb.net/?appName=Cluster0
```

## ✅ Required Changes

### Step 1: Replace the Password
Replace `<db_password>` with your actual database user password.

**Example:**
```
mongodb+srv://prabin:MySecurePassword123@cluster0.8uds5sw.mongodb.net/?appName=Cluster0
```

### Step 2: Add Database Name (Recommended)
Add your database name to the connection string for better organization:

```
mongodb+srv://prabin:YOUR_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority
```

**Full format:**
```
mongodb+srv://prabin:YOUR_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority&appName=Cluster0
```

## 🔒 Security Checklist

- [ ] ✅ Replace `<db_password>` with your actual password
- [ ] ✅ Test connection locally (optional)
- [ ] ✅ Add database name: `clinic_management`
- [ ] ✅ Keep password secure (never commit to git!)

## 📋 For Render Deployment

When deploying to Render, use this format in the `MONGODB_URI` environment variable:

```
mongodb+srv://prabin:YOUR_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority
```

### Important Notes:
- Replace `YOUR_PASSWORD` with your actual password
- The database `clinic_management` will be created automatically on first connection
- Make sure your MongoDB Atlas IP whitelist allows access (add `0.0.0.0/0` for Render)

## 🧪 Test Connection (Optional)

You can test your connection string locally before deploying:

1. Create a test file: `test-connection.js`
```javascript
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    const uri = 'mongodb+srv://prabin:YOUR_PASSWORD@cluster0.8uds5sw.mongodb.net/clinic_management?retryWrites=true&w=majority';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully!');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();
```

2. Run: `node test-connection.js`

## 🚀 Next Steps

1. **Format your connection string** (replace password and add database name)
2. **Deploy to Render** - Use the formatted string in `MONGODB_URI` environment variable
3. **Test** - Check Render logs to confirm connection

---

**Remember:** Never share or commit your password to git! Always use environment variables.
