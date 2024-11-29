import mongoose from "mongoose";

const aboutUsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutUsSchema);

export default About;
