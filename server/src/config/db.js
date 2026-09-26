const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collabflow';
    
    // First attempt to connect to specified MONGODB_URI (e.g. Atlas or local daemon) with short timeout
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`✅ MongoDB Connected (${mongoUri.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local'}): ${conn.connection.host}`);
      return conn;
    } catch (directErr) {
      console.warn(`⚠️ Direct MongoDB connection to ${mongoUri} failed (${directErr.message}).`);
      console.log(`🚀 Initializing zero-setup Embedded MongoDB Engine for seamless local execution...`);
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`✅ Embedded In-Memory MongoDB Connected: ${memUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`❌ MongoDB Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
