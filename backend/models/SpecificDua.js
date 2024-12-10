import mongoose from "mongoose";

const SpecificDuaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: String,
    content: String,
  },
  { timestamps: true }
);

const SpecificDua = mongoose.models.SpecificDua || mongoose.model("SpecificDua", SpecificDuaSchema);

export default SpecificDua;
