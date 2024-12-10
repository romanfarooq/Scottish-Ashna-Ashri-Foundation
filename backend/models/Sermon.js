import mongoose from "mongoose";

const SermonTranslationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  description: String,
});

const SermonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    arabicTitle: { type: String, required: true },
    subTitle: String,
    text: String,
    translations: [SermonTranslationSchema],
    audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
  },
  { timestamps: true }
);

const Sermon = mongoose.models.Sermon || mongoose.model("Sermon", SermonSchema);

export default Sermon;
