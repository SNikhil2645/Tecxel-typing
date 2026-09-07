const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Try standard connection first if uri is provided and not default localhost without mongod
  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] Connected to external MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[Database] Failed to connect to external MongoDB URI: ${err.message}`);
      // Fall through to memory server fallback in development
    }
  }

  // Try local connection if specified
  try {
    const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/tecxl', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to local MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(`[Database] Local MongoDB not detected (${err.message}). Starting In-Memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] In-memory database initialization failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
