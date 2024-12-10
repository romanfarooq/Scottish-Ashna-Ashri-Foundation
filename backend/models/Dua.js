import mongoose from "mongoose";

const DuaTranslationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  description: String,
});

const DuaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    arabicTitle: { type: String, required: true },
    subTitle: String,
    text: String,
    translations: [DuaTranslationSchema],
    audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
  },
  { timestamps: true }
);

const Dua = mongoose.models.Dua || mongoose.model("Dua", DuaSchema);

export default Dua;
