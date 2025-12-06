const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MONGODB_URI environment variable is not set!');
      process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('Please check:');
    console.error('1. MONGODB_URI environment variable is set correctly');
    console.error('2. MongoDB Atlas IP whitelist includes Render IPs (or 0.0.0.0/0)');
    console.error('3. MongoDB username and password are correct');
    process.exit(1);
  }
};

module.exports = connectDB;