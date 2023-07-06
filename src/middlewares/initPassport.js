import passport from "passport";
import FacebookStrategy from "passport-facebook";
import GoogleStrategy from "passport-google-oauth20";
import { facebook, google } from "../middlewares/passportConfig";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

export const initPassport = (app) => {
  //init's the app session
  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SECRET,
    })
  );
  //init passport
  app.use(passport.initialize());
  app.use(passport.session());
};

////////// FACEBOOK //////////
passport.use(
  new FacebookStrategy(
    facebook,
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      done(null, profile);
    }
  )
);

////////// GOOGLE //////////
passport.use(
  new GoogleStrategy(
    google,
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      //done(err, user) will return the user we got from fb
      done(null, profile);
    }
  )
);

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));
