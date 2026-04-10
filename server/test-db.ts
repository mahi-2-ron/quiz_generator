import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testDB = async () => {
  try {
    console.log("Attempting to connect to:", process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`\n✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Check collections
    if (conn.connection.db) {
        const collections = await conn.connection.db.collections();
        console.log("\n📦 Collections in the database:");
        if (collections.length === 0) {
            console.log("   (No collections found - database is currently empty)");
        } else {
            for (let collection of collections) {
                console.log(`   - ${collection.collectionName}`);
            }
        }
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

testDB();
