import mongoose from "mongoose";

const AyahTranslationSchema = new mongoose.Schema({
  ayahNumber: { type: Number, required: true },
  text: { type: String, required: true },
});

const TranslationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  translation: [AyahTranslationSchema],
});

const AyahSchema = new mongoose.Schema({
  ayahNumber: { type: Number, required: true },
  text: { type: String, required: true },
  audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
});

const SurahSchema = new mongoose.Schema({
  surahNumber: { type: Number, required: true },
  name: { type: String, required: true },
  englishName: { type: String, required: true },
  meaning: { type: String, required: true },
  audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
  translations: [TranslationSchema],
  ayat: [AyahSchema],
});

const Surah = mongoose.models.Surah || mongoose.model("Surah", SurahSchema);

export default Surah;
