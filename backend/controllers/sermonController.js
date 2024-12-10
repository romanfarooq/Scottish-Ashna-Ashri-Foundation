import mongoose from "mongoose";
import Sermon from "../models/Sermon.js";
import { gfsAudio } from "../config/db.js";
import { body, param, validationResult } from "express-validator";

const SermonValidationRules = [
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

export const getAllSermons = async (req, res) => {
  try {
    const sermons = await Sermon.find({}, { translations: 0, audioFileId: 0 });
    res.json({ sermons });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Sermons" });
  }
};

export const getSermonById = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sermon = await Sermon.findById(req.params.id);
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }
      res.json({ sermon });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Sermon" });
    }
  },
];

export const addSermon = [
  SermonValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, arabicTitle, subTitle, text, translations } = req.body;
      const newSermon = new Sermon({
        title,
        arabicTitle,
        subTitle,
        text,
        translations,
      });
      await newSermon.save();
      res.status(201).json({ message: "Sermon created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create Sermon" });
    }
  },
];

export const updateSermon = [
  idValidationRule,
  SermonValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const newSermon = req.body;

      const updatedSermon = await Sermon.findByIdAndUpdate(
        req.params.id,
        newSermon,
        {
          new: true,
        }
      );

      if (!updatedSermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      res.json({ message: "Sermon updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update Sermon" });
    }
  },
];

export const deleteSermon = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sermon = await Sermon.findByIdAndDelete(req.params.id);

      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      res.json({ message: "Sermon deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Sermon" });
    }
  },
];

export const uploadSermonAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sermon = await Sermon.findByIdAndUpdate(
        req.params.id,
        {
          audioFileId: new mongoose.Types.ObjectId(req.file.id),
        },
        { new: true }
      );

      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      res.json({ message: "Audio file uploaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  },
];

export const getSermonAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sermon = await Sermon.findById(req.params.id);
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      if (!sermon.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const files = await gfsAudio.find({ _id: sermon.audioFileId }).toArray();
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

        const downloadStream = gfsAudio.openDownloadStream(sermon.audioFileId, {
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
        const downloadStream = gfsAudio.openDownloadStream(sermon.audioFileId);

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

export const deleteSermonAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sermon = await Sermon.findById(req.params.id);
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      if (!sermon.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      await gfsAudio.delete(sermon.audioFileId);

      sermon.audioFileId = null;
      await sermon.save();

      res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audio file" });
    }
  },
];

export const getSermonTranslations = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sermon = await Sermon.findById(req.params.id);
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      res.json(sermon.translations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  },
];

export const addSermonTranslation = [
  idValidationRule,
  translationValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;

    try {
      const sermon = await Sermon.findById(req.params.id);
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      const existingTranslation = sermon.translations.find(
        (t) => t.language === language
      );
      if (existingTranslation) {
        return res.status(400).json({ message: "Translation already exists" });
      }

      sermon.translations.push({ language, title, text, description });

      await sermon.save();

      res.json({ message: "Translation created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create translation" });
    }
  },
];

export const updateSermonTranslation = [
  idValidationRule,
  translationValidationRules,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;
    try {
      const sermon = await Sermon.findById(req.params.id);
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      const translation = sermon.translations.find(
        (t) => t.language === req.params.language
      );
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }

      translation.language = language;
      translation.title = title;
      translation.text = text;
      translation.description = description;

      await sermon.save();

      res.json({ message: "Translation updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update translation" });
    }
  },
];

export const deleteSermonTranslation = [
  idValidationRule,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const sermon = await Sermon.findById(req.params.id);
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      const translationIndex = sermon.translations.findIndex(
        (t) => t.language === req.params.language
      );
      if (translationIndex === -1) {
        return res.status(404).json({ message: "Translation not found" });
      }

      sermon.translations.splice(translationIndex, 1);

      await sermon.save();

      res.json({ message: "Translation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete translation" });
    }
  },
];
