const { MongoClient } = require("mongodb");

const url = process.env.MONGODB_URI; 
const client = new MongoClient(url);
let db;

async function connectMongo() {
  try {
    await client.connect();
    db = client.db("test");
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

function getDb() {
  return db;
}

module.exports = { connectMongo, getDb };
