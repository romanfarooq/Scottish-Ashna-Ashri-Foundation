import mongoose from "mongoose";

let gfs;

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    gfs = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: "audio",
    });
    console.log("GridFS Bucket Initialized");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
}

export { gfs };
