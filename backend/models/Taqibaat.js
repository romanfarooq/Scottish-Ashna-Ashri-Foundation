import mongoose from "mongoose";

const TaqibaatTranslationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  description: String,
});

const TaqibaatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  arabicTitle: { type: String, required: true },
  subTitle: String,
  text: String,
  translations: [TaqibaatTranslationSchema],
  audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
});

const Taqibaat = mongoose.models.Taqibaat || mongoose.model("Taqibaat", TaqibaatSchema);

export default Taqibaat;