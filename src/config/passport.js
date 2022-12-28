import passportjwt from 'passport-jwt';
import User from "../models/authModel.js";

const JwtStrategy = passportjwt.Strategy;
const ExtractJwt = passportjwt.ExtractJwt;

export function passportJwt(passport) {
  const opts = {
     jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
     secretOrKey: 'waridiauthsecret',
  };
  passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
    User
      .findByPk(jwt_payload.id)
      .then((user) => {return done(null, user);})
      .catch((error) => {return done(error, false);});
  }));
};
