import mongoose from "mongoose";

let gfsAudio, gfsImage;

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    gfsAudio = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: "audio",
    });
    gfsImage = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: "image",
    });
    console.log("GridFS Buckets Initialized");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export { gfsAudio, gfsImage };
