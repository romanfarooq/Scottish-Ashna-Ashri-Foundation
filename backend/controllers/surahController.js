import Surah from "../models/Surah.js";
import { gfs } from "../config/db.js";
import mongoose, { Types } from "mongoose";
import { body, param, validationResult } from "express-validator";

export const validateSurahNumber = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
];

export const validateAddorUpdateSurah = [
  body("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  body("name").isString().notEmpty().withMessage("Name is required."),
  body("englishName")
    .isString()
    .notEmpty()
    .withMessage("English name is required."),
  body("meaning").isString().notEmpty().withMessage("Meaning is required."),
  body("ayat")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Ayat must be an array.")
    .custom((value) => {
      if (value && value.length > 0) {
        for (const ayah of value) {
          if (!ayah.ayahNumber || !ayah.text) {
            throw new Error("Each ayah must have ayahNumber and text.");
          }
          if (
            typeof ayah.ayahNumber !== "number" ||
            typeof ayah.text !== "string"
          ) {
            throw new Error(
              "ayahNumber must be a number and text must be a string."
            );
          }
        }
      }
      return true;
    }),
];

export const validateAddorUpdateAyah = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  body("ayat")
    .isArray()
    .withMessage("Ayat must be an array.")
    .custom((value) => {
      for (const ayah of value) {
        if (!ayah.ayahNumber || !ayah.text) {
          throw new Error("Each ayah must have ayahNumber and text.");
        }
        if (
          typeof ayah.ayahNumber !== "number" ||
          typeof ayah.text !== "string"
        ) {
          throw new Error(
            "ayahNumber must be a number and text must be a string."
          );
        }
      }
      return true;
    }),
];

export const validateAddAudio = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  param("ayahNumber")
    .isInt({ gt: 0 })
    .withMessage("Ayah number must be a positive integer."),
  body("audio").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("No file uploaded.");
    }
    return true;
  }),
];

export const validateGetAudio = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  param("ayahNumber")
    .isInt({ gt: 0 })
    .withMessage("Ayah number must be a positive integer."),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

export const getAllSurahs = async (req, res) => {
  try {
    const surahs = await Surah.find({}, { _id: 0, __v: 0, ayat: 0 });
    res.status(200).json({ surahs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Surahs." });
  }
};

// Get a single Surah by its number
export const getSurahByNumber = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    try {
      const surah = await Surah.findOne(
        { surahNumber: parseInt(surahNumber, 10) },
        { _id: 0, __v: 0, "ayat._id": 0 }
      );
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }
      res.status(200).json({ surah });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Surah." });
    }
  },
];

// Add a new Surah
export const addSurah = [
  validateAddorUpdateSurah,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber, name, englishName, meaning, ayat } = req.body;
    try {
      if (await Surah.exists({ surahNumber })) {
        return res.status(400).json({ message: "Surah already exists." });
      }

      const newSurah = new Surah({
        surahNumber,
        name,
        englishName,
        meaning,
        ayat,
      });
      await newSurah.save();
      res.status(201).json({ message: "Surah added successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to add Surah." });
    }
  },
];

// Update an existing Surah
export const updateSurah = [
  validateAddorUpdateSurah,
  handleValidationErrors,
  async (req, res) => {
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
  },
];

// Delete an existing Surah
export const deleteSurah = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { surahNumber } = req.params;
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
  },
];

// Add a new Ayah to a Surah
export const addAyah = [
  validateAddorUpdateAyah,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    const { ayat } = req.body;
    try {
      const surah = await Surah.findOneAndUpdate(
        { surahNumber: parseInt(surahNumber, 10) },
        { $set: { ayat } },
        { new: true }
      );
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }
      res.status(201).json({ message: "Ayah added successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to add Ayah." });
    }
  },
];

export const addAudio = [
  validateAddAudio,
  handleValidationErrors,
  async (req, res) => {
    const { file } = req;
    const { surahNumber, ayahNumber } = req.params;
    try {
      const updatedSurah = await Surah.findOneAndUpdate(
        { surahNumber, "ayat.ayahNumber": Number(ayahNumber) },
        { $set: { "ayat.$.audioFileId": new mongoose.Types.ObjectId(file.id) } },
        { new: true }
      );

      if (!updatedSurah) {
        return res
          .status(404)
          .json({ message: "Failed to update Surah or Ayah not found." });
      }

      res
        .status(200)
        .json({ message: "Audio uploaded and linked successfully." });
    } catch (error) {
      res.status(500).json({ message: "Audio upload failed." });
    }
  },
];

export const getAudio = [
  validateGetAudio,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber, ayahNumber } = req.params;
    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      const ayah = surah.ayat.find((a) => a.ayahNumber === Number(ayahNumber));
      if (!ayah || !ayah.audioFileId) {
        return res
          .status(404)
          .json({ message: "Audio not found for this ayah." });
      }

      const downloadStream = gfs.openDownloadStream(ayah.audioFileId);

      res.set("Content-Type", "audio/mpeg"); // Ensure the correct MIME type
      downloadStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to stream audio." });
    }
  },
];
