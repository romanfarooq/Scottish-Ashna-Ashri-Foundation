import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import Admin from "../models/Admin.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
          return done(null, false, { message: "Admin not found" });
        }

        const isMatch = await admin.isValidPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, admin);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((admin, done) => done(null, admin.id));

passport.deserializeUser(async (id, done) => {
  try {
    const admin = await Admin.findById(id);
    done(null, admin);
  } catch (err) {
    done(err);
  }
});

export default passport;
