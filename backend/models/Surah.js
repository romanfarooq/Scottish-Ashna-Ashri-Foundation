import mongoose from "mongoose";

const SurahImageTajweedSchema = new mongoose.Schema({
  pageNumber: { type: Number, required: true },
  imageFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "image.files",
    required: true,
  },
});

const SurahImageSchema = new mongoose.Schema({
  pageNumber: { type: Number, required: true },
  imageFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "image.files",
    required: true,
  },
});

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

const SurahSchema = new mongoose.Schema(
  {
    surahNumber: { type: Number, required: true },
    name: { type: String, required: true },
    englishName: { type: String, required: true },
    meaning: { type: String, required: true },
    juzzNumber: { type: Number, required: true },
    audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audio.files" },
    translations: [TranslationSchema],
    ayat: [AyahSchema],
    images: [SurahImageSchema],
    tajweedImages: [SurahImageTajweedSchema],
  },
  { timestamps: true }
);

const Surah = mongoose.models.Surah || mongoose.model("Surah", SurahSchema);

export default Surah;
