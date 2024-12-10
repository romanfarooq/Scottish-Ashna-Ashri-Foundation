import mongoose from "mongoose";
import Taqibaat from "../models/Taqibaat.js";
import { gfsAudio } from "../config/db.js";
import { body, param, validationResult } from "express-validator";

const taqibaatValidationRules = [
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

export const getAllTaqibaats = async (req, res) => {
  try {
    const taqibaats = await Taqibaat.find(
      {},
      { translations: 0, audioFileId: 0 }
    );
    res.json({ taqibaats });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch taqibaats" });
  }
};

export const getTaqibaatById = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const taqibaat = await Taqibaat.findById(req.params.id);
      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }
      res.json({ taqibaat });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch taqibaat" });
    }
  },
];

export const addTaqibaat = [
  taqibaatValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, arabicTitle, subTitle, text, translations } = req.body;
      const newTaqibaat = new Taqibaat({
        title,
        arabicTitle,
        subTitle,
        text,
        translations,
      });
      await newTaqibaat.save();
      res.status(201).json({ message: "Taqibaat created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create taqibaat" });
    }
  },
];

export const updateTaqibaat = [
  idValidationRule,
  taqibaatValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const newTaqibaat = req.body;

      const updatedTaqibaat = await Taqibaat.findByIdAndUpdate(
        req.params.id,
        newTaqibaat,
        {
          new: true,
        }
      );

      if (!updatedTaqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      res.json({ message: "Taqibaat updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update taqibaat" });
    }
  },
];

export const deleteTaqibaat = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const taqibaat = await Taqibaat.findByIdAndDelete(req.params.id);

      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      res.json({ message: "Taqibaat deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete taqibaat" });
    }
  },
];

export const uploadTaqibaatAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const taqibaat = await Taqibaat.findByIdAndUpdate(
        req.params.id,
        {
          audioFileId: new mongoose.Types.ObjectId(req.file.id),
        },
        { new: true }
      );

      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      res.json({ message: "Audio file uploaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  },
];

export const getTaqibaatAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const taqibaat = await Taqibaat.findById(req.params.id);
      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      if (!taqibaat.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const files = await gfsAudio
        .find({ _id: taqibaat.audioFileId })
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
          taqibaat.audioFileId,
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
          taqibaat.audioFileId
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

export const deleteTaqibaatAudio = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const taqibaat = await Taqibaat.findById(req.params.id);
      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      if (!taqibaat.audioFileId) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      await gfsAudio.delete(taqibaat.audioFileId);

      taqibaat.audioFileId = null;
      await taqibaat.save();

      res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audio file" });
    }
  },
];

export const getTaqibaatTranslations = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const taqibaat = await Taqibaat.findById(req.params.id);
      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      res.json(taqibaat.translations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  },
];

export const addTaqibaatTranslation = [
  idValidationRule,
  translationValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;

    try {
      const taqibaat = await Taqibaat.findById(req.params.id);
      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      const existingTranslation = taqibaat.translations.find(
        (t) => t.language === language
      );
      if (existingTranslation) {
        return res.status(400).json({ message: "Translation already exists" });
      }

      taqibaat.translations.push({ language, title, text, description });

      await taqibaat.save();

      res.json({ message: "Translation created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create translation" });
    }
  },
];

export const updateTaqibaatTranslation = [
  idValidationRule,
  translationValidationRules,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { language, title, text, description } = req.body;
    try {
      const taqibaat = await Taqibaat.findById(req.params.id);
      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      const translation = taqibaat.translations.find(
        (t) => t.language === req.params.language
      );
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }

      translation.language = language;
      translation.title = title;
      translation.text = text;
      translation.description = description;

      await taqibaat.save();

      res.json({ message: "Translation updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update translation" });
    }
  },
];

export const deleteTaqibaatTranslation = [
  idValidationRule,
  translationUpdateOrDeleteValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { id, language } = req.params;
    try {
      const taqibaat = await Taqibaat.findById(req.params.id);
      if (!taqibaat) {
        return res.status(404).json({ message: "Taqibaat not found" });
      }

      const translationIndex = taqibaat.translations.findIndex(
        (t) => t.language === language
      );

      if (translationIndex === -1) {
        return res.status(404).json({ message: "Translation not found" });
      }

      taqibaat.translations.splice(translationIndex, 1);

      await taqibaat.save();

      res.json({ message: "Translation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete translation" });
    }
  },
];
