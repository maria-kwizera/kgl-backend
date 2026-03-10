const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);
}

module.exports = { connectDB };
