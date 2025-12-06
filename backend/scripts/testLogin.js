/**
 * Test login endpoint directly
 * Usage: node backend/scripts/testLogin.js <email> <password>
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://clinic-management-backend-2fuj.onrender.com';

async function testLogin(email, password) {
  try {
    console.log('\n🧪 Testing Login API...\n');
    console.log(`Backend URL: ${BACKEND_URL}/api/auth/login`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password ? '***' : 'NOT PROVIDED'}\n`);

    // Test health endpoint first
    console.log('1️⃣  Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
      console.log('   ✅ Backend is running');
      console.log(`   Response:`, healthResponse.data);
    } catch (error) {
      console.log('   ❌ Backend health check failed');
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      }
      return;
    }

    // Test login endpoint
    console.log('\n2️⃣  Testing login endpoint...');
    const loginResponse = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      {
        email: email,
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 600 // Accept all status codes
      }
    );

    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response:`, JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.status === 200) {
      console.log('\n   ✅ LOGIN SUCCESSFUL!');
      console.log(`   User: ${loginResponse.data.data?.user?.firstName} ${loginResponse.data.data?.user?.lastName}`);
      console.log(`   Role: ${loginResponse.data.data?.user?.role}`);
      console.log(`   Token: ${loginResponse.data.data?.token?.substring(0, 20)}...`);
    } else {
      console.log('\n   ❌ LOGIN FAILED');
      console.log(`   Message: ${loginResponse.data?.message || 'Unknown error'}`);
      
      if (loginResponse.data?.errors) {
        console.log(`   Validation Errors:`, loginResponse.data.errors);
      }
    }

    console.log('\n✅ Test complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error testing login:');
    
    if (error.response) {
      // Server responded with error status
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Request was made but no response received
      console.error(`   No response from server`);
      console.error(`   Check if backend is running at: ${BACKEND_URL}`);
      console.error(`   Error: ${error.message}`);
    } else {
      // Error setting up request
      console.error(`   Error: ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Get arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node backend/scripts/testLogin.js <email> <password>');
  console.log('Example: node backend/scripts/testLogin.js admin@clinic.com Admin@123');
  console.log('\nOr set BACKEND_URL environment variable:');
  console.log('BACKEND_URL=https://clinic-management-backend-2fuj.onrender.com node backend/scripts/testLogin.js admin@clinic.com Admin@123');
  process.exit(1);
}

testLogin(email, password);
