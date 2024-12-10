import SpecificDua from "../models/SpecificDua.js";
import { body, param, validationResult } from "express-validator";

// Validation rules
const specificDuaValidationRules = [
  body("title").isString().notEmpty().withMessage("Title is required"),
  body("subTitle").isString().optional(),
  body("content").isString().optional().withMessage("Content is required"),
];

const idValidationRule = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

// Error handling middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Route: Fetch all SpecificDuas
export const getAllSpecificDuas = async (req, res) => {
  try {
    const specificDuas = await SpecificDua.find({}, { __v: 0, content: 0 });
    res.json({ specificDuas });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch specific duas" });
  }
};

// Route: Fetch a single SpecificDua by ID
export const getSpecificDuaById = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const specificDua = await SpecificDua.findById(req.params.id);

      if (!specificDua) {
        return res.status(404).json({ message: "SpecificDua not found" });
      }

      res.json({ specificDua });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch specific dua" });
    }
  },
];

// Route: Create a new SpecificDua
export const addSpecificDua = [
  specificDuaValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, subTitle, content } = req.body;

      const newSpecificDua = new SpecificDua({
        title,
        subTitle,
        content,
      });

      await newSpecificDua.save();

      res.status(201).json({ message: "SpecificDua created successfully", specificDua: newSpecificDua });
    } catch (error) {
      res.status(500).json({ message: "Failed to create specific dua" });
    }
  },
];

// Route: Update a SpecificDua by ID
export const updateSpecificDua = [
  idValidationRule,
  specificDuaValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const updates = req.body;

      const updatedSpecificDua = await SpecificDua.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (!updatedSpecificDua) {
        return res.status(404).json({ message: "SpecificDua not found" });
      }

      res.json({ message: "SpecificDua updated successfully", specificDua: updatedSpecificDua });
    } catch (error) {
      res.status(500).json({ message: "Failed to update specific dua" });
    }
  },
];

// Route: Delete a SpecificDua by ID
export const deleteSpecificDua = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const deletedSpecificDua = await SpecificDua.findByIdAndDelete(req.params.id);

      if (!deletedSpecificDua) {
        return res.status(404).json({ message: "SpecificDua not found" });
      }

      res.json({ message: "SpecificDua deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete specific dua" });
    }
  },
];
