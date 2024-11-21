import Admin from "../models/Admin.js";

export const login = (req, res) => {
  res.json({ message: "Logged in successfully" });
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    // Destroy session explicitly
    req.session.destroy((destroyErr) => {
      if (destroyErr) return res.status(500).json({ message: "Failed to destroy session" });
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
  });
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const newAdmin = new Admin({ email, password });
    await newAdmin.save();
    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error registering admin", error: err.message });
  }
};

export const getAdmin = (req, res) => {
  res.json({ message: "You have access", admin: req.user });
};
