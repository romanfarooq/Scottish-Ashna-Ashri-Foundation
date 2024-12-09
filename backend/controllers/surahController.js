import mongoose from "mongoose";
import archiver from "archiver";
import Surah from "../models/Surah.js";
import Tajweed from "../models/Tajweed.js";
import { gfsAudio, gfsImage } from "../config/db.js";
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
  body("juzzNumber")
    .isInt({ gt: 0 })
    .withMessage("Juzz number must be a positive integer."),
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

const validateSurahImages = [
  param("surahNumber")
    .isInt({ gt: 0 })
    .withMessage("Surah number must be a positive integer."),
  body("images").custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("No files uploaded.");
    }
    return true;
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
    const surahs = await Surah.find(
      {},
      { _id: 0, __v: 0, ayat: 0, translations: 0, images: 0, tajweedImages: 0 }
    );
    res.status(200).json({ surahs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Surahs." });
  }
};

export const getAllSurahsWithImages = async (req, res) => {
  try {
    const surahs = await Surah.find(
      {},
      {
        _id: 0,
        __v: 0,
        ayat: 0,
        translations: 0,
        tajweedImages: 0,
        "images._id": 0,
      }
    );
    res.status(200).json({ surahs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Surahs." });
  }
};

export const getAllSurahsWithTajweedImages = async (req, res) => {
  try {
    const surahs = await Surah.find(
      {},
      {
        _id: 0,
        __v: 0,
        ayat: 0,
        translations: 0,
        images: 0,
        "tajweedImages._id": 0,
      }
    );
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
          images: 0,
          tajweedImages: 0,
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
    const {
      surahNumber,
      name,
      englishName,
      meaning,
      juzzNumber,
      ayat,
      translations,
    } = req.body;
    try {
      if (await Surah.exists({ surahNumber })) {
        return res.status(400).json({ message: "Surah already exists." });
      }

      const newSurah = new Surah({
        surahNumber,
        name,
        englishName,
        meaning,
        juzzNumber,
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
        gfsAudio.delete(surah.audioFileId, (err) => {
          if (err) {
            console.error("Error deleting audio from GridFS:", err);
          }
        });
      }

      for (const ayah of surah.ayat) {
        if (ayah.audioFileId) {
          gfsAudio.delete(ayah.audioFileId, (err) => {
            if (err) {
              console.error("Error deleting audio from GridFS:", err);
            }
          });
        }
      }

      for (const image of surah.images) {
        if (image.imageFileId) {
          gfsImage.delete(image.imageFileId, (err) => {
            if (err) {
              console.error("Error deleting image from GridFS:", err);
            }
          });
        }
      }

      for (const image of surah.tajweedImages) {
        if (image.imageFileId) {
          gfsImage.delete(image.imageFileId, (err) => {
            if (err) {
              console.error("Error deleting image from GridFS:", err);
            }
          });
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

      const files = await gfsAudio.find({ _id: surah.audioFileId }).toArray();
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

        const downloadStream = gfsAudio.openDownloadStream(surah.audioFileId, {
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
        const downloadStream = gfsAudio.openDownloadStream(surah.audioFileId);

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

      gfsAudio.delete(surah.audioFileId, (err) => {
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

      const files = await gfsAudio.find({ _id: ayah.audioFileId }).toArray();
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

        const downloadStream = gfsAudio.openDownloadStream(ayah.audioFileId, {
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
        const downloadStream = gfsAudio.openDownloadStream(ayah.audioFileId);

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

      gfsAudio.delete(ayah.audioFileId, (err) => {
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

export const uploadSurahImages = [
  validateSurahImages,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    const files = req.files;
    files.sort((a, b) => a.originalname.localeCompare(b.originalname));
    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }
      const imageRecords = files.map((file, index) => ({
        pageNumber: index + 1,
        imageFileId: file.id,
      }));
      await surah.updateOne({ $push: { images: { $each: imageRecords } } });
      res.status(200).json({
        message: "Images uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  },
];

export const getSurahImages = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;

    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      const sortedImages = surah.images.sort(
        (a, b) => a.pageNumber - b.pageNumber
      );

      const imageFileIds = sortedImages.map((image) => image.imageFileId);

      const imagesPromise = imageFileIds.map(
        (id) =>
          new Promise(async (resolve, reject) => {
            let files;
            try {
              files = await gfsImage.find({ _id: id }).toArray();
            } catch (err) {
              reject(err);
            }
            if (!files || files.length === 0) {
              return reject(new Error("Image metadata not found."));
            }
            const file = files[0];
            const mimeType = file.contentType;
            const chunks = [];
            const downloadStream = gfsImage.openDownloadStream(id);

            downloadStream
              .on("data", (chunk) => {
                chunks.push(chunk);
              })
              .on("end", () => {
                const buffer = Buffer.concat(chunks).toString("base64");
                resolve(`data:${mimeType};base64,${buffer}`);
              })
              .on("error", (error) => {
                reject(error);
              });
          })
      );

      const images = await Promise.all(imagesPromise);

      res.status(200).json({ images });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Error fetching images." });
    }
  },
];

export const deleteSurahImages = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      for (const image of surah.images) {
        gfsImage.delete(image.imageFileId, (err) => {
          if (err) {
            console.error("Error deleting image from GridFS:", err);
          }
        });
      }

      await surah.updateOne({ $set: { images: [] } });

      res.status(200).json({ message: "Images deleted successfully." });
    } catch (error) {
      console.error("Error deleting images:", error);
      res.status(500).json({ message: "Failed to delete images." });
    }
  },
];

export const downloadSurahImagesZip = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;

    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      const imageFileIds = surah.images.map((image) => image.imageFileId);

      const archive = archiver("zip");
      archive.pipe(res);
      for (const [index, id] of imageFileIds.entries()) {
        try {
          const files = await gfsImage.find({ _id: id }).toArray();

          if (!files || files.length === 0) {
            console.warn(`Image not found for ID: ${id}`);
            continue;
          }

          const file = files[0];
          const mimeType = file.contentType;
          const downloadStream = gfsImage.openDownloadStream(id);

          archive.append(downloadStream, {
            name: `${index + 1}.${mimeType.split("/")[1]}`,
          });
        } catch (error) {
          console.error(`Error processing image ${id}:`, error);
        }
      }

      await archive.finalize();
    } catch (error) {
      console.error("Error downloading images:", error);
      res.status(500).json({ message: "Failed to download images." });
    }
  },
];

export const uploadSurahTajweedImages = [
  validateSurahImages,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    const files = req.files;
    files.sort((a, b) => a.originalname.localeCompare(b.originalname));
    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }
      const imageRecords = files.map((file, index) => ({
        pageNumber: index + 1,
        imageFileId: file.id,
      }));
      await surah.updateOne({
        $push: { tajweedImages: { $each: imageRecords } },
      });
      res.status(200).json({
        message: "Images uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  },
];

export const getSurahTajweedImages = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;

    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      const sortedImages = surah.tajweedImages.sort(
        (a, b) => a.pageNumber - b.pageNumber
      );

      const imageFileIds = sortedImages.map((image) => image.imageFileId);

      const imagesPromise = imageFileIds.map(
        (id) =>
          new Promise(async (resolve, reject) => {
            let files;
            try {
              files = await gfsImage.find({ _id: id }).toArray();
            } catch (err) {
              reject(err);
            }
            if (!files || files.length === 0) {
              return reject(new Error("Image metadata not found."));
            }
            const file = files[0];
            const mimeType = file.contentType;
            const chunks = [];
            const downloadStream = gfsImage.openDownloadStream(id);

            downloadStream
              .on("data", (chunk) => {
                chunks.push(chunk);
              })
              .on("end", () => {
                const buffer = Buffer.concat(chunks).toString("base64");
                resolve(`data:${mimeType};base64,${buffer}`);
              })
              .on("error", (error) => {
                reject(error);
              });
          })
      );

      const images = await Promise.all(imagesPromise);

      res.status(200).json({ images });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Error fetching images." });
    }
  },
];

export const deleteSurahTajweedImages = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;
    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      for (const image of surah.tajweedImages) {
        gfsImage.delete(image.imageFileId, (err) => {
          if (err) {
            console.error("Error deleting image from GridFS:", err);
          }
        });
      }

      await surah.updateOne({ $set: { tajweedImages: [] } });

      res.status(200).json({ message: "Images deleted successfully." });
    } catch (error) {
      console.error("Error deleting images:", error);
      res.status(500).json({ message: "Failed to delete images." });
    }
  },
];

export const downloadSurahTajweedImagesZip = [
  validateSurahNumber,
  handleValidationErrors,
  async (req, res) => {
    const { surahNumber } = req.params;

    try {
      const surah = await Surah.findOne({ surahNumber });
      if (!surah) {
        return res.status(404).json({ message: "Surah not found." });
      }

      const imageFileIds = surah.tajweedImages.map(
        (image) => image.imageFileId
      );

      const archive = archiver("zip");
      archive.pipe(res);

      for (const [index, id] of imageFileIds.entries()) {
        try {
          const files = await gfsImage.find({ _id: id }).toArray();

          if (!files || files.length === 0) {
            console.warn(`Image not found for ID: ${id}`);
            continue;
          }

          const file = files[0];
          const mimeType = file.contentType;
          const downloadStream = gfsImage.openDownloadStream(id);

          archive.append(downloadStream, {
            name: `${index + 1}.${mimeType.split("/")[1]}`,
          });
        } catch (error) {
          console.error(`Error processing image ${id}:`, error);
        }
      }

      await archive.finalize();
    } catch (error) {
      console.error("Error downloading images:", error);
      res.status(500).json({ message: "Failed to download images." });
    }
  },
];

export const AddTajweedRuleImage = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  try {
    const newRule = new Tajweed({
      imageFileId: new mongoose.Types.ObjectId(file.id),
    });
    await newRule.save();
    res.status(200).json({ message: "Rule image uploaded successfully." });
  } catch (error) {
    console.error("Error uploading rule image:", error);
    res.status(500).json({ message: "Failed to upload rule image." });
  }
};

export const deleteTajweedRuleImage = async (req, res) => {
  try {
    const rule = await Tajweed.findOne();
    if (!rule) {
      return res.status(404).json({ message: "Rule image not found." });
    }

    gfsImage.delete(rule.imageFileId, (err) => {
      if (err) {
        console.error("Error deleting rule image from GridFS:", err);
      }
    });

    await rule.deleteOne();

    res.status(200).json({ message: "Rule image deleted successfully." });
  } catch (error) {
    console.error("Error deleting rule image:", error);
    res.status(500).json({ message: "Failed to delete rule image." });
  }
};

export const getTajweedRuleImage = async (req, res) => {
  try {
    const rule = await Tajweed.findOne();
    if (!rule || !rule.imageFileId) {
      return res.status(404).json({ message: "Rule image not found." });
    }

    const files = await gfsImage.find({ _id: rule.imageFileId }).toArray();
    if (!files || files.length === 0) {
      return res
        .status(404)
        .json({ message: "Rule image metadata not found." });
    }

    const file = files[0];
    const mimeType = file.contentType;

    const downloadStream = gfsImage.openDownloadStream(rule.imageFileId);

    downloadStream.on("error", (err) => {
      console.error("Error reading image from GridFS:", err);
      res.status(500).json({ message: "Failed to retrieve rule image." });
    });

    res.set("Content-Type", mimeType);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving rule image:", error);
    res.status(500).json({ message: "Failed to retrieve rule image." });
  }
};
