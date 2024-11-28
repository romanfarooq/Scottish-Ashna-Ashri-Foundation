import { body, validationResult } from "express-validator";
import crypto from "crypto";
import passport from "passport";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";

export const isLoggedIn = (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return res.json({ isAuthenticated: true });
  }
  res.json({ isAuthenticated: false });
};

export const login = [
  body("email").isEmail().withMessage("Email is required and should be valid"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    passport.authenticate("admin-local", (err, user, info) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "An error occurred during login" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in" });
        }
        return res.json({ message: "Logged in successfully" });
      });
    })(req, res, next);
  },
];

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({ message: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
};

export const forgotPassword = [
  body("email").isEmail().withMessage("Email is required and should be valid"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

      // Save OTP to the database
      admin.otp = otp;
      admin.otpExpires = otpExpires;
      await admin.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send OTP via email
      transporter.sendMail(
        {
          from: process.env.EMAIL_FROM,
          to: admin.email,
          subject: "Password Reset OTP",
          text: `Your OTP for password reset is: ${otp}`,
        },
        (error, info) => {
          if (error) {
            console.error("Error sending OTP:", error);
            return res.status(500).json({ message: "Error sending OTP" });
          }
          res.json({ message: "OTP sent successfully" });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  },
];

// Verify OTP Controller
export const verifyOtp = [
  body("email").isEmail().withMessage("Email is required and should be valid"),
  body("otp").isNumeric().withMessage("OTP should be numeric"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, otp } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Check OTP and expiration
      if (admin.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (admin.otpExpires < new Date()) {
        return res.status(400).json({ message: "Expired OTP" });
      }

      // Increase the expiration time of the OTP
      admin.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

      // OTP is valid
      res.json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error verifying OTP" });
    }
  },
];

// Reset Password Controller
export const resetPassword = [
  body("email").isEmail().withMessage("Email is required and should be valid"),
  body("otp").isNumeric().withMessage("OTP should be numeric"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*#?&]/)
    .withMessage("Password must contain at least one special character"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, otp, newPassword } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (admin.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (admin.otpExpires < new Date()) {
        return res
          .status(400)
          .json({ message: "Reset Password Session Expired" });
      }

      const isSamePassword = await admin.isValidPassword(newPassword);
      if (isSamePassword) {
        return res.status(400).json({
          message: "New password cannot be the same as the old password",
        });
      }

      // Update the password
      admin.password = newPassword;
      admin.otp = undefined; // Clear OTP
      admin.otpExpires = undefined; // Clear OTP expiration
      await admin.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Change Password Controller
export const changePassword = [
  body("email").isEmail().withMessage("Email is required and should be valid"),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*#?&]/)
    .withMessage("Password must contain at least one special character"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, currentPassword, newPassword } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Verify current password
      const isMatch = await admin.isValidPassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const isSamePassword = await admin.isValidPassword(newPassword);
      if (isSamePassword) {
        return res.status(400).json({
          message: "New password cannot be the same as the old password",
        });
      }

      // Update the password
      admin.password = newPassword;
      await admin.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
];
