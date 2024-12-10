import mongoose from "mongoose";

const SalatSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: String,
    content: String,
  },
  { timestamps: true }
);

const Salat = mongoose.models.Salat || mongoose.model("Salat", SalatSchema);

export default Salat;
