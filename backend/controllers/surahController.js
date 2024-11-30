import Surah from "../models/Surah.js";

// Get all Surahs
export const getAllSurahs = async (req, res) => {
  try {
    const surahs = await Surah.aggregate([
      {
        $project: {
          _id: 0, // Exclude MongoDB's default `_id`
          surahNumber: 1,
          name: 1,
          englishName: 1,
          meaning: 1,
          totalAyat: { $size: "$ayat" }, // Count the number of ayat
        },
      },
    ]);
    res.status(200).json({ surahs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Surahs." });
  }
};

// Get a single Surah by its number
export const getSurahByNumber = async (req, res) => {
  const { surahNumber } = req.params;
  try {
    const surah = await Surah.findOne(
      {
        surahNumber: parseInt(surahNumber, 10),
      },
      { _id: 0, __v: 0, "ayat._id": 0 }
    );
    if (!surah) {
      return res.status(404).json({ message: "Surah not found." });
    }
    res.status(200).json(surah);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Surah." });
  }
};

// Add a new Surah
export const addSurah = async (req, res) => {
  const { surahNumber, name, englishName, meaning, ayat } = req.body;
  try {
    const newSurah = new Surah({ surahNumber, name, englishName, meaning, ayat });
    await newSurah.save();
    res.status(201).json({ message: "Surah added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to add Surah." });
  }
};

// Update an existing Surah
export const updateSurah = async (req, res) => {
  const { surahNumber } = req.params;
  const updatedSurah = req.body;
  try {
    const surah = await Surah.findOneAndUpdate(
      { surahNumber: parseInt(surahNumber, 10) },
      updatedSurah,
      { new: true }
    );
    if (!surah) {
      return res.status(404).json({ message: "Surah not found." });
    }
    res.status(200).json({ message: "Surah updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to update Surah." });
  }
};

// Delete an existing Surah
export const deleteSurah = async (req, res) => {
  const { surahNumber } = req.params;
  try {
    const surah = await Surah.findOneAndDelete({
      surahNumber: parseInt(surahNumber, 10),
    });
    if (!surah) {
      return res.status(404).json({ message: "Surah not found." });
    }
    res.status(200).json({ message: "Surah deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete Surah." });
  }
};
