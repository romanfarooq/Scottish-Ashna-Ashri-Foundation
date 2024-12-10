import Salat from "../models/Salat.js";
import { body, param, validationResult } from "express-validator";

// Validation rules
const salatValidationRules = [
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

// Route: Fetch all Salats
export const getAllSalats = async (req, res) => {
  try {
    const salats = await Salat.find({}, { __v: 0, content: 0 });
    res.json({ salats });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch salats" });
  }
};

// Route: Fetch a single Salat by ID
export const getSalatById = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const salat = await Salat.findById(req.params.id);

      if (!salat) {
        return res.status(404).json({ message: "Salat not found" });
      }

      res.json({ salat });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch salat" });
    }
  },
];

// Route: Create a new Salat
export const addSalat = [
  salatValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, subTitle, content } = req.body;

      const newSalat = new Salat({
        title,
        subTitle,
        content,
      });

      await newSalat.save();

      res.status(201).json({ message: "Salat created successfully", salat: newSalat });
    } catch (error) {
      res.status(500).json({ message: "Failed to create salat" });
    }
  },
];

// Route: Update a Salat by ID
export const updateSalat = [
  idValidationRule,
  salatValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const updates = req.body;

      const updatedSalat = await Salat.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (!updatedSalat) {
        return res.status(404).json({ message: "Salat not found" });
      }

      res.json({ message: "Salat updated successfully", salat: updatedSalat });
    } catch (error) {
      res.status(500).json({ message: "Failed to update salat" });
    }
  },
];

// Route: Delete a Salat by ID
export const deleteSalat = [
  idValidationRule,
  handleValidationErrors,
  async (req, res) => {
    try {
      const deletedSalat = await Salat.findByIdAndDelete(req.params.id);

      if (!deletedSalat) {
        return res.status(404).json({ message: "Salat not found" });
      }

      res.json({ message: "Salat deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete salat" });
    }
  },
];
