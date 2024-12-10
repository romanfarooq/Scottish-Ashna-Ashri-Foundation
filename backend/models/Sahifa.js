import mongoose from "mongoose";

const SahifaTranslationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  description: String,
});

const SahifaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    arabicTitle: { type: String, required: true },
    subTitle: String,
    text: String,
    translations: [SahifaTranslationSchema],
    audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
  },
  { timestamps: true }
);

const Sahifa = mongoose.models.Sahifa || mongoose.model("Sahifa", SahifaSchema);

export default Sahifa;
