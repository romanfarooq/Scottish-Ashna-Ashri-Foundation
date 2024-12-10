import mongoose from "mongoose";
import Dua from "../models/Dua.js";
import { gfsAudio } from "../config/db.js";
import { body, param, validationResult } from "express-validator";

const duaValidationRules = [
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

export const getAllDuas = async (req, res) => {
  try {
    const duas = await Dua.find({}, { translations: 0, audioFileId: 0 });
    res.json({ duas });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch duas" });
  }
};

export const getDuaById = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const dua = await Dua.findById(req.params.id);
      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }
      res.json({ dua });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dua" });
    }
  },
];

export const addDua = [
  duaValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, arabicTitle, subTitle, text, translations } = req.body;
      const newDua = new Dua({
        title,
        arabicTitle,
        subTitle,
        text,
        translations,
      });
      await newDua.save();
      res.status(201).json({ message: "Dua created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create dua" });
    }
  },
];

export const updateDua = [
  idValidationRule,
  duaValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const newDua = req.body;

      const updatedDua = await Dua.findByIdAndUpdate(req.params.id, newDua, {
        new: true,
      });

      if (!updatedDua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      res.json({ message: "Dua updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update dua" });
    }
  },
];

export const deleteDua = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const dua = await Dua.findByIdAndDelete(req.params.id);

      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      res.json({ message: "Dua deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dua" });
    }
  },
];

export const uploadDuaAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    console.log(req.params.id);
    console.log(req.file);
    try {
      const dua = await Dua.findByIdAndUpdate(
        req.params.id,
        {
          audioFileId: new mongoose.Types.ObjectId(req.file.id),
        },
        { new: true }
      );

      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      res.json({ message: "Audio file uploaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  },
];

export const getDuaAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const dua = await Dua.findById(req.params.id);
      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      if (!dua.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const files = await gfsAudio.find({ _id: dua.audioFileId }).toArray();
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

        const downloadStream = gfsAudio.openDownloadStream(dua.audioFileId, {
          start,
          end: end + 1,
        });

        res.status(206);
        res.set("Content-Range", `bytes ${start}-${end}/${length}`);
        res.set("Accept-Ranges", "bytes");
        res.set("Content-Length", chunkSize);
        res.set("Content-Type", contentType);

        downloadStream.pipe(res);
      } else {
        const downloadStream = gfsAudio.openDownloadStream(dua.audioFileId);

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

export const deleteDuaAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const dua = await Dua.findById(req.params.id);
      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      if (!dua.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      await gfsAudio.delete(dua.audioFileId);

      dua.audioFileId = null;
      await dua.save();

      res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audio file" });
    }
  },
];

export const getDuaTranslations = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const dua = await Dua.findById(req.params.id);
      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      res.json(dua.translations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  },
];

export const addDuaTranslation = [
  idValidationRule,
  translationValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;

    try {
      const dua = await Dua.findById(req.params.id);
      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      const existingTranslation = dua.translations.find(
        (t) => t.language === language
      );
      if (existingTranslation) {
        return res.status(400).json({ message: "Translation already exists" });
      }

      dua.translations.push({ language, title, text, description });

      await dua.save();

      res.json({ message: "Translation created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create translation" });
    }
  },
];

export const updateDuaTranslation = [
  idValidationRule,
  translationValidationRules,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;
    try {
      const dua = await Dua.findById(req.params.id);
      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      const translation = dua.translations.find(
        (t) => t.language === req.params.language
      );
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }

      translation.language = language;
      translation.title = title;
      translation.text = text;
      translation.description = description;

      await dua.save();

      res.json({ message: "Translation updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update translation" });
    }
  },
];

export const deleteDuaTranslation = [
  idValidationRule,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { id, language } = req.params;
    try {
      const dua = await Dua.findById(req.params.id);
      if (!dua) {
        return res.status(404).json({ message: "Dua not found" });
      }

      const translationIndex = dua.translations.findIndex(
        (t) => t.language === language
      );

      if (translationIndex === -1) {
        return res.status(404).json({ message: "Translation not found" });
      }

      dua.translations.splice(translationIndex, 1);

      await dua.save();

      res.json({ message: "Translation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete translation" });
    }
  },
];
