import mongoose from "mongoose";
import Sahifa from "../models/Sahifa.js";
import { gfsAudio } from "../config/db.js";
import { body, param, validationResult } from "express-validator";

const sahifaValidationRules = [
  body("title").isString().notEmpty().withMessage("Title is required"),
  body("arabicTitle")
    .isString()
    .notEmpty()
    .withMessage("Arabic title is required"),
  body("text").isString().optional().withMessage("Text is required"),
  body("subTitle").isString().optional(),
  body("translations").isArray().optional(),
];

const translationValidationRules = [
  body("language")
    .isString()
    .notEmpty()
    .trim()
    .withMessage("Language is required"),
  body("text")
    .isString()
    .notEmpty()
    .trim()
    .withMessage("Translation text is required"),
  body("title").isString().notEmpty().trim().withMessage("Title is required"),
  body("description").isString().optional().trim(),
];

const idValidationRule = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

const translationUpdateOrDeleteValidationRules = [
  param("language").isString().notEmpty().withMessage("Language is required"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

export const getAllSahifas = async (req, res) => {
  try {
    const sahifas = await Sahifa.find({}, { translations: 0, audioFileId: 0 });
    res.json({ sahifas });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sahifas" });
  }
};

export const getSahifaById = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sahifa = await Sahifa.findById(req.params.id);
      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }
      res.json({ sahifa });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sahifa" });
    }
  },
];

export const addSahifa = [
  sahifaValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, arabicTitle, subTitle, text, translations } = req.body;
      const newSahifa = new Sahifa({
        title,
        arabicTitle,
        subTitle,
        text,
        translations,
      });
      await newSahifa.save();
      res.status(201).json({ message: "Sahifa created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create sahifa" });
    }
  },
];

export const updateSahifa = [
  idValidationRule,
  sahifaValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const newSahifa = req.body;

      const updatedSahifa = await Sahifa.findByIdAndUpdate(
        req.params.id,
        newSahifa,
        {
          new: true,
        }
      );

      if (!updatedSahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      res.json({ message: "Sahifa updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update sahifa" });
    }
  },
];

export const deleteSahifa = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sahifa = await Sahifa.findById(req.params.id);

      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      if (sahifa.audioFileId) {
        await gfsAudio.delete(sahifa.audioFileId);
      }

      await Sahifa.findByIdAndDelete(req.params.id);

      res.json({ message: "Sahifa deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sahifa" });
    }
  },
];

export const uploadSahifaAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sahifa = await Sahifa.findByIdAndUpdate(
        req.params.id,
        {
          audioFileId: new mongoose.Types.ObjectId(req.file.id),
        },
        { new: true }
      );

      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      res.json({ message: "Audio file uploaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  },
];

export const getSahifaAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sahifa = await Sahifa.findById(req.params.id);
      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      if (!sahifa.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const files = await gfsAudio
        .find({ _id: sahifa.audioFileId })
        .toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({ message: "Audio metadata not found." });
      }

      const file = files[0];
      const { length, contentType } = file;
      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        const range = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(range[0], 10);
        const end = range[1] ? parseInt(range[1], 10) : length - 1;

        if (start >= length || end >= length) {
          return res
            .status(416)
            .json({ message: "Requested Range Not Satisfiable" });
        }

        const chunkSize = end - start + 1;

        const downloadStream = gfsAudio.openDownloadStream(
          sahifa.audioFileId,
          {
            start,
            end: end + 1,
          }
        );

        res.status(206);
        res.set("Content-Range", `bytes ${start}-${end}/${length}`);
        res.set("Accept-Ranges", "bytes");
        res.set("Content-Length", chunkSize);
        res.set("Content-Type", contentType);

        downloadStream.pipe(res);
      } else {
        const downloadStream = gfsAudio.openDownloadStream(
          sahifa.audioFileId
        );

        downloadStream.on("error", (err) => {
          console.error("Error streaming audio:", err);
          res.status(500).json({ message: "Failed to stream audio." });
        });

        res.status(200);
        res.set("Content-Type", contentType);
        res.set("Content-Length", length);
        downloadStream.pipe(res);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audio file" });
    }
  },
];

export const deleteSahifaAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sahifa = await Sahifa.findById(req.params.id);
      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      if (!sahifa.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      await gfsAudio.delete(sahifa.audioFileId);

      sahifa.audioFileId = null;
      await sahifa.save();

      res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audio file" });
    }
  },
];

export const getSahifaTranslations = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sahifa = await Sahifa.findById(req.params.id);
      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      res.json(sahifa.translations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  },
];

export const addSahifaTranslation = [
  idValidationRule,
  translationValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;

    try {
      const sahifa = await Sahifa.findById(req.params.id);
      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      const existingTranslation = sahifa.translations.find(
        (t) => t.language === language
      );
      if (existingTranslation) {
        return res.status(400).json({ message: "Translation already exists" });
      }

      sahifa.translations.push({ language, title, text, description });

      await sahifa.save();

      res.json({ message: "Translation created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create translation" });
    }
  },
];

export const updateSahifaTranslation = [
  idValidationRule,
  translationValidationRules,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;
    try {
      const sahifa = await Sahifa.findById(req.params.id);
      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      const translation = sahifa.translations.find(
        (t) => t.language === req.params.language
      );
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }

      translation.language = language;
      translation.title = title;
      translation.text = text;
      translation.description = description;

      await sahifa.save();

      res.json({ message: "Translation updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update translation" });
    }
  },
];

export const deleteSahifaTranslation = [
  idValidationRule,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { id, language } = req.params;
    try {
      const sahifa = await Sahifa.findById(req.params.id);
      if (!sahifa) {
        return res.status(404).json({ message: "Sahifa not found" });
      }

      const translationIndex = sahifa.translations.findIndex(
        (t) => t.language === language
      );

      if (translationIndex === -1) {
        return res.status(404).json({ message: "Translation not found" });
      }

      sahifa.translations.splice(translationIndex, 1);

      await sahifa.save();

      res.json({ message: "Translation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete translation" });
    }
  },
];
