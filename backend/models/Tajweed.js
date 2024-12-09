import mongoose from "mongoose";

const TajweedSchema = new mongoose.Schema({
  imageFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "image.files",
    required: true,
  },
});

const Tajweed =
  mongoose.models.Tajweed || mongoose.model("Tajweed", TajweedSchema);

export default Tajweed;
