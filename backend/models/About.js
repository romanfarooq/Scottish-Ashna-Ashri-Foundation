import mongoose from "mongoose";

const AboutUsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const About = mongoose.models.About || mongoose.model("About", AboutUsSchema);

export default About;
