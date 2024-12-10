import mongoose from "mongoose";
import Ziarah from "../models/Ziarah.js";
import { gfsAudio } from "../config/db.js";
import { body, param, validationResult } from "express-validator";

const ziarahValidationRules = [
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

export const getAllZiarahs = async (req, res) => {
  try {
    const ziarahs = await Ziarah.find({}, { translations: 0, audioFileId: 0 });
    res.json({ ziarahs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ziarahs" });
  }
};

export const getZiarahById = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const ziarah = await Ziarah.findById(req.params.id);
      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }
      res.json({ ziarah });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ziarah" });
    }
  },
];

export const addZiarah = [
  ziarahValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, arabicTitle, subTitle, text, translations } = req.body;
      const newZiarah = new Ziarah({
        title,
        arabicTitle,
        subTitle,
        text,
        translations,
      });
      await newZiarah.save();
      res.status(201).json({ message: "Ziarah created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create ziarah" });
    }
  },
];

export const updateZiarah = [
  idValidationRule,
  ziarahValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const newZiarah = req.body;

      const updatedZiarah = await Ziarah.findByIdAndUpdate(req.params.id, newZiarah, {
        new: true,
      });

      if (!updatedZiarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      res.json({ message: "Ziarah updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update ziarah" });
    }
  },
];

export const deleteZiarah = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const ziarah = await Ziarah.findById(req.params.id);

      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      if (ziarah.audioFileId) {
        await gfsAudio.delete(ziarah.audioFileId);
      }

      await ziarah.remove();

      res.json({ message: "Ziarah deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ziarah" });
    }
  },
];

export const uploadZiarahAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const ziarah = await Ziarah.findByIdAndUpdate(
        req.params.id,
        {
          audioFileId: new mongoose.Types.ObjectId(req.file.id),
        },
        { new: true }
      );

      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      res.json({ message: "Audio file uploaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  },
];

export const getZiarahAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const ziarah = await Ziarah.findById(req.params.id);
      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      if (!ziarah.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const files = await gfsAudio.find({ _id: ziarah.audioFileId }).toArray();
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

        const downloadStream = gfsAudio.openDownloadStream(ziarah.audioFileId, {
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
        const downloadStream = gfsAudio.openDownloadStream(ziarah.audioFileId);

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

export const deleteZiarahAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const ziarah = await Ziarah.findById(req.params.id);
      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      if (!ziarah.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      await gfsAudio.delete(ziarah.audioFileId);

      ziarah.audioFileId = null;
      await ziarah.save();

      res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audio file" });
    }
  },
];

export const getZiarahTranslations = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const ziarah = await Ziarah.findById(req.params.id);
      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      res.json(ziarah.translations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  },
];

export const addZiarahTranslation = [
  idValidationRule,
  translationValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;

    try {
      const ziarah = await Ziarah.findById(req.params.id);
      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      const existingTranslation = ziarah.translations.find(
        (t) => t.language === language
      );
      if (existingTranslation) {
        return res.status(400).json({ message: "Translation already exists" });
      }

      ziarah.translations.push({ language, title, text, description });

      await ziarah.save();

      res.json({ message: "Translation created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create translation" });
    }
  },
];

export const updateZiarahTranslation = [
  idValidationRule,
  translationValidationRules,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;
    try {
      const ziarah = await Ziarah.findById(req.params.id);
      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      const translation = ziarah.translations.find(
        (t) => t.language === req.params.language
      );
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }

      translation.language = language;
      translation.title = title;
      translation.text = text;
      translation.description = description;

      await ziarah.save();

      res.json({ message: "Translation updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update translation" });
    }
  },
];

export const deleteZiarahTranslation = [
  idValidationRule,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { id, language } = req.params;
    try {
      const ziarah = await Ziarah.findById(req.params.id);
      if (!ziarah) {
        return res.status(404).json({ message: "Ziarah not found" });
      }

      const translationIndex = ziarah.translations.findIndex(
        (t) => t.language === language
      );

      if (translationIndex === -1) {
        return res.status(404).json({ message: "Translation not found" });
      }

      ziarah.translations.splice(translationIndex, 1);

      await ziarah.save();

      res.json({ message: "Translation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete translation" });
    }
  },
];