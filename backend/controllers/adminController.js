import crypto from "crypto";
import passport from "passport";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.js";

export const isLoggedIn = (req, res) => {
  res.json({ isAuthenticated: req.isAuthenticated() });
};

export const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: "An error occurred during login",
      });
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
};

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

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
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

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

    // increase the expiration time of the OTP
    admin.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    // OTP is valid
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

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
        .json({ message: "Reset Passsword Session Expired" });
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
};

export const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    if (!email || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, current password, and new password are required" });
    }

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password cannot be the same as the current password" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await admin.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update the password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
