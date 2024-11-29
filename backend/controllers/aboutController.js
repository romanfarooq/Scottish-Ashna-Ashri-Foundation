import { body, validationResult } from "express-validator";
import About from "../models/About.js";

export const getAbout = async (req, res) => {
  try {
    const aboutUs = await About.find().sort({ createdAt: -1 }).limit(1);
    if (aboutUs.length === 0) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(aboutUs[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch content" });
  }
};

export const updateAbout = [
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .trim()
    .isString()
    .withMessage("Content must be a valid string"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0] });
    }
    try {
      const { content } = req.body;
      const existingAboutUs = await About.findOne();
      if (existingAboutUs) {
        existingAboutUs.content = content;
        await existingAboutUs.save();
        return res
          .status(200)
          .json({ message: "Content updated successfully" });
      } else {
        const newAboutUs = new About({ content });
        await newAboutUs.save();
        res.status(200).json({ message: "Content saved successfully" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to save content" });
    }
  },
];
