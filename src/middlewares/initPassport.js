import { facebook, google } from "./passportConfig";
import session from "express-session";
import "dotenv/config";

export const initPassport = (app) => {
  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SECRET,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  //Facebook Strategy
  passport.use(
    new FacebookStrategy(
      facebook,
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        //done(err, user) will return the user we got from fb
        done(null, formatFB(profile._json));
      }
    )
  );

  // Serialize user into the sessions
  passport.serializeUser((user, done) => done(null, user));

  // Deserialize user from the sessions
  passport.deserializeUser((user, done) => done(null, user));

  ////////// Format data//////////

  const formatFB = (profile) => {
    return {
      username: profile.username,
      email: profile.email,
    };
  };
};
