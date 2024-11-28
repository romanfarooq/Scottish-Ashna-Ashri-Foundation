import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

// Admin strategy
passport.use(
  "admin-local",
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

// User strategy
passport.use(
  "user-local",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize and deserialize users based on role
passport.serializeUser((entity, done) => {
  done(null, {
    id: entity.id,
    role: entity instanceof Admin ? "admin" : "user",
  });
});

passport.deserializeUser(async ({ id, role }, done) => {
  try {
    const model = role === "admin" ? Admin : User;
    const entity = await model.findById(id);
    if (!entity) {
      return done(new Error(`${role} not found`));
    }
    entity.role = role;
    done(null, entity);
  } catch (err) {
    done(err);
  }
});

export default passport;
