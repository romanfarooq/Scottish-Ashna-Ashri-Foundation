import mongoose from "mongoose";
import Surah from "../models/Surah.js";
import { gfsAudio } from "../config/db.js";
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
  body("translations")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Translations must be an array."),
  body("translations.*.language")
    .isString()
    .withMessage("Each translation must have a valid language (string)."),
  body("translations.*.translation")
    .isArray()
    .withMessage("Each translation must contain a translation array."),
  body("translations.*.translation.*.ayahNumber")
    .isInt({ min: 1 })
    .withMessage("Each ayahNumber must be a positive integer."),
  body("translations.*.translation.*.text")
    .isString()
    .withMessage("Each translation text must be a string."),
];

const validateAddSurahAudio = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  body("audio").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("No file uploaded.");
    }
    return true;
  }),
];

export const validateSurahGetOrDeleteAudio = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
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
  body("translations")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Translations must be an array."),
  body("translations.*.language")
    .isString()
    .withMessage("Each translation must have a valid language (string)."),
  body("translations.*.translation")
    .isArray()
    .withMessage("Each translation must contain a translation array."),
  body("translations.*.translation.*.ayahNumber")
    .isInt({ min: 1 })
    .withMessage("Each ayahNumber must be a positive integer."),
  body("translations.*.translation.*.text")
    .isString()
    .withMessage("Each translation text must be a string."),
];

export const validateAddAyahAudio = [
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

export const validateAyahGetOrDeleteAudio = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  param("ayahNumber")
    .isInt({ gt: 0 })
    .withMessage("Ayah number must be a positive integer."),
];

export const validateAddTranslation = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  body("language").isString().notEmpty().withMessage("Language is required."),
  body("translation")
    .isArray()
    .withMessage("Translations must be an array.")
    .custom((value) => {
      for (const ayah of value) {
        if (!ayah.ayahNumber || !ayah.text) {
          throw new Error("Each ayah must have ayahNumber and text.");
        }
        if (typeof ayah.ayahNumber !== "number") {
          throw new Error("ayahNumber must be a number.");
        }
        if (typeof ayah.text !== "string") {
          throw new Error("text must be a string.");
        }
        return true;
      }
    }),
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

export const getSurahByNumber = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    try {
      const surah = await Surah.findOne(
        { surahNumber: parseInt(surahNumber, 10) },
        {
          _id: 0,
          __v: 0,
          "ayat._id": 0,
          "translations._id": 0,
          "translations.translation._id": 0,
        }
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

export const addSurah = [
  validateAddorUpdateSurah,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber, name, englishName, meaning, ayat, translations } =
      req.body;
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
        translations,
      });
      await newSurah.save();
      res.status(201).json({ message: "Surah added successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to add Surah." });
    }
  },
];

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

export const deleteSurah = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { surahNumber } = req.params;

      const surah = await Surah.findOne({
        surahNumber: parseInt(surahNumber, 10),
      });

      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      if (surah.audioFileId) {
        gfsAudio.delete(
          new mongoose.Types.ObjectId(surah.audioFileId),
          (err) => {
            if (err) {
              console.error("Error deleting audio from GridFS:", err);
            }
          }
        );
      }

      for (const ayah of surah.ayat) {
        if (ayah.audioFileId) {
          gfsAudio.delete(
            new mongoose.Types.ObjectId(ayah.audioFileId),
            (err) => {
              if (err) {
                console.error("Error deleting audio from GridFS:", err);
              }
            }
          );
        }
      }

      await Surah.deleteOne({ surahNumber: parseInt(surahNumber, 10) });

      res.status(200).json({ message: "Surah deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Surah." });
    }
  },
];

export const addSurahAudio = [
  validateAddSurahAudio,
  handleValidationErrors,
  async (req, res) => {
    const { file } = req;
    const { surahNumber } = req.params;
    try {
      const updatedSurah = await Surah.findOneAndUpdate(
        { surahNumber },
        { $set: { audioFileId: new mongoose.Types.ObjectId(file.id) } },
        { new: true }
      );

      if (!updatedSurah) {
        return res
          .status(404)
          .json({ message: "Failed to update Surah or Surah not found." });
      }

      res
        .status(200)
        .json({ message: "Audio uploaded and linked successfully." });
    } catch (error) {
      res.status(500).json({ message: "Audio upload failed." });
    }
  },
];

export const getSurahAudio = [
  validateSurahGetOrDeleteAudio,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      if (!surah.audioFileId) {
        return res
          .status(404)
          .json({ message: "Audio not found for this surah." });
      }

      const downloadStream = gfsAudio.openDownloadStream(surah.audioFileId);

      downloadStream.on("error", (err) => {
        console.error("Error streaming audio:", err);
        res.status(500).json({ message: "Failed to stream audio." });
      });

      res.set("Content-Type", "audio/mpeg");
      downloadStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to stream audio." });
    }
  },
];

export const deleteSurahAudio = [
  validateSurahGetOrDeleteAudio,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      if (!surah.audioFileId) {
        return res
          .status(404)
          .json({ message: "No audio associated with this surah." });
      }

      gfsAudio.delete(new mongoose.Types.ObjectId(surah.audioFileId), (err) => {
        if (err) {
          console.error("Error deleting audio from GridFS:", err);
          return res
            .status(500)
            .json({ message: "Failed to delete audio file from storage." });
        }
      });

      const updatedSurah = await Surah.findOneAndUpdate(
        { surahNumber },
        { $unset: { audioFileId: "" } },
        { new: true }
      );

      if (!updatedSurah) {
        return res
          .status(404)
          .json({ message: "Failed to update Surah or Surah not found." });
      }

      res.status(200).json({ message: "Audio deleted successfully." });
    } catch (error) {
      console.error("Error in deleteAudio:", error);
      res.status(500).json({ message: "Audio deletion failed." });
    }
  },
];

export const addAyah = [
  validateAddorUpdateAyah,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    const { ayat, translations } = req.body;
    try {
      const surah = await Surah.findOneAndUpdate(
        { surahNumber: parseInt(surahNumber, 10) },
        { $set: { ayat, translations } },
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

export const addAyahAudio = [
  validateAddAyahAudio,
  handleValidationErrors,
  async (req, res) => {
    const { file } = req;
    const { surahNumber, ayahNumber } = req.params;
    try {
      const updatedSurah = await Surah.findOneAndUpdate(
        { surahNumber, "ayat.ayahNumber": Number(ayahNumber) },
        {
          $set: { "ayat.$.audioFileId": new mongoose.Types.ObjectId(file.id) },
        },
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

export const getAyahAudio = [
  validateAyahGetOrDeleteAudio,
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

      const downloadStream = gfsAudio.openDownloadStream(ayah.audioFileId);

      downloadStream.on("error", (err) => {
        console.error("Error streaming audio:", err);
        res.status(500).json({ message: "Failed to stream audio." });
      });

      res.set("Content-Type", "audio/mpeg");
      downloadStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to stream audio." });
    }
  },
];

export const deleteAyahAudio = [
  validateAyahGetOrDeleteAudio,
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
          .json({ message: "No audio associated with this ayah." });
      }

      const audioFileId = ayah.audioFileId;
      gfsAudio.delete(new mongoose.Types.ObjectId(audioFileId), (err) => {
        if (err) {
          console.error("Error deleting audio from GridFS:", err);
          return res
            .status(500)
            .json({ message: "Failed to delete audio file from storage." });
        }
      });

      const updatedSurah = await Surah.findOneAndUpdate(
        { surahNumber, "ayat.ayahNumber": Number(ayahNumber) },
        { $unset: { "ayat.$.audioFileId": "" } },
        { new: true }
      );

      if (!updatedSurah) {
        return res
          .status(404)
          .json({ message: "Failed to update Surah or Ayah not found." });
      }

      res.status(200).json({ message: "Audio deleted successfully." });
    } catch (error) {
      console.error("Error in deleteAudio:", error);
      res.status(500).json({ message: "Audio deletion failed." });
    }
  },
];

export const addTranslation = [
  validateAddTranslation,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    const { language, translation } = req.body;

    try {
      const existingSurah = await Surah.findOne({
        surahNumber: parseInt(surahNumber, 10),
        "translations.language": language,
      });

      if (existingSurah) {
        return res.status(400).json({
          message: `Translation for the language '${language}' already exists.`,
        });
      }

      const updatedSurah = await Surah.findOneAndUpdate(
        { surahNumber: parseInt(surahNumber, 10) },
        { $push: { translations: { language, translation } } },
        { new: true }
      );

      if (!updatedSurah) {
        return res.status(404).json({
          message: "Surah not found.",
        });
      }

      res.status(200).json({
        message: "Translation added successfully.",
        surah: updatedSurah,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to add translation.",
        error: error.message,
      });
    }
  },
];

export const deleteTranslation = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber, language } = req.params;

    try {
      const surah = await Surah.findOneAndUpdate(
        { surahNumber: parseInt(surahNumber, 10) },
        { $pull: { translations: { language } } },
        { new: true }
      );

      if (!surah) {
        return res.status(404).json({
          message: "Translation not found or Surah does not exist.",
        });
      }

      res.status(200).json({
        message: "Translation deleted successfully.",
        surah,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete translation.",
        error: error.message,
      });
    }
  },
];
