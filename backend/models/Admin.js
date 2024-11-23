import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: true, 
    validate: {
      validator: function (value) {
        return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value);
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long",
    },
  },
  otp: { type: String },
  otpExpires: { type: Date },
});

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password validation
AdminSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
