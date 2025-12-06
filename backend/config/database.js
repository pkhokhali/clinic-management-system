const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      console.error('Please add MONGODB_URI to your Render environment variables.');
      process.exit(1);
    }

    // Log connection attempt (without password for security)
    const uriWithoutPassword = mongoURI.replace(/:[^:@]+@/, ':****@');
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', uriWithoutPassword);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('\nPlease verify:');
    console.error('1. MONGODB_URI is set in Render environment variables');
    console.error('2. Connection string format: mongodb+srv://username:password@host/database?retryWrites=true&w=majority');
    console.error('3. MongoDB Atlas IP whitelist includes 0.0.0.0/0 (all IPs)');
    console.error('4. Username and password are correct');
    console.error('5. Network connectivity from Render to MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = connectDB;