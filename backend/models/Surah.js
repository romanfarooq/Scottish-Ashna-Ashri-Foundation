import mongoose from "mongoose";

const AyahSchema = new mongoose.Schema({
  ayahNumber: { type: Number, required: true },
  text: { type: String, required: true },
});

const SurahSchema = new mongoose.Schema({
  surahNumber: { type: Number, required: true },
  name: { type: String, required: true },
  englishName: { type: String, required: true },
  meaning: { type: String, required: true },
  ayat: [AyahSchema],
});

const Surah = mongoose.model("Surah", SurahSchema);

export default Surah;
