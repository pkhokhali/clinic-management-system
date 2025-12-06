/**
 * Diagnostic script to check user password in MongoDB
 * Run: node backend/scripts/checkUserPassword.js <email>
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

async function checkUser(email) {
  try {
    await connectDB();

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      return;
    }

    console.log('\n📋 User Details:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);

    // Check password field
    if (!user.password) {
      console.log(`\n❌ Password field is empty or undefined!`);
      console.log(`   This user cannot login. Password needs to be reset.`);
      return;
    }

    // Check if password is hashed
    const isHashed = /^\$2[aby]\$\d+\$/.test(user.password);
    console.log(`\n🔐 Password Status:`);
    console.log(`   Is Hashed: ${isHashed ? '✅ Yes' : '❌ No (STORED IN PLAIN TEXT!)'}`);
    
    if (isHashed) {
      console.log(`   Hash Type: ${user.password.substring(0, 4)}`);
      console.log(`   Hash Length: ${user.password.length} characters`);
    } else {
      console.log(`   ⚠️  WARNING: Password is stored in plain text!`);
      console.log(`   This is a security issue. The user needs to reset their password.`);
    }

    // If password provided as argument, test it
    const testPassword = process.argv[3];
    if (testPassword) {
      console.log(`\n🧪 Testing Password:`);
      try {
        if (isHashed) {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          console.log(`   Password Match: ${isMatch ? '✅ YES' : '❌ NO'}`);
        } else {
          const isMatch = testPassword === user.password;
          console.log(`   Password Match (plain text): ${isMatch ? '✅ YES' : '❌ NO'}`);
        }
      } catch (error) {
        console.log(`   ❌ Error comparing password: ${error.message}`);
      }
    }

    console.log('\n✅ Check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node backend/scripts/checkUserPassword.js <email> [password]');
  console.log('Example: node backend/scripts/checkUserPassword.js admin@clinic.com Admin@123');
  process.exit(1);
}

checkUser(email);
