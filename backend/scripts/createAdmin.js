const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User.model');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Default admin credentials
    const adminEmail = 'admin@clinic.com';
    const adminPassword = 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    ' + adminEmail);
      console.log('Password: (Already set - use existing password)');
      console.log('Role:     ' + existingAdmin.role);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\nTo reset password, update the user manually or delete and recreate.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create Super Admin
    const admin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: adminEmail,
      phone: '9800000000',
      password: adminPassword,
      role: 'Super Admin',
      isActive: true,
      isEmailVerified: true,
    });

    console.log('\n✅ Super Admin created successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   ADMIN LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ' + adminEmail);
    console.log('Password: ' + adminPassword);
    console.log('Role:     Super Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n✅ Admin account is ready to use.\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

createAdmin();