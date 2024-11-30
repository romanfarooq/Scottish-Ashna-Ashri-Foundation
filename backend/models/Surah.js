import mongoose from "mongoose";

const AyahSchema = new mongoose.Schema({
  ayahNumber: Number,
  text: String,
});

const SurahSchema = new mongoose.Schema({
  surahNumber: Number,
  name: String,
  englishName: String,
  ayat: [AyahSchema],
});

const Surah = mongoose.model("Surah", SurahSchema);

export default Surah;
