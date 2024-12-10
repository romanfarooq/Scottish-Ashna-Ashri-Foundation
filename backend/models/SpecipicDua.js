import mongoose from "mongoose";

const aboutUsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: String,
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutUsSchema);

export default About;
