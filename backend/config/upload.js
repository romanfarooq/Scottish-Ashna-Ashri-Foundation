import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

const audioStorage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      bucketName: "audio",
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

const imageStorage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      bucketName: "images",
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

export const audioUpload = multer({ storage: audioStorage });
export const imageUpload = multer({ storage: imageStorage });
