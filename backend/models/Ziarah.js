import mongoose from "mongoose";

const ZiarahTranslationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  description: String,
});

const ZiarahSchema = new mongoose.Schema({
  title: { type: String, required: true },
  arabicTitle: { type: String, required: true },
  subTitle: String,
  text: String,
  translations: [ZiarahTranslationSchema],
  audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
});

const Ziarah = mongoose.models.Ziarah || mongoose.model("Ziarah", ZiarahSchema);

export default Ziarah;