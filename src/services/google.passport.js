import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

// Configure passport to use google strategy
passport.use(
   new GoogleStrategy(
      {
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: "/auth/google/callback",
         passReqToCallback: true,
      },
      async function (request, accessToken, refreshToken, profile, done) {
         // Here you would typically find or create a user in your database
         const randomePassword =
            Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
         const randomePhone =
            Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) +
            1000000000;
         let newUser = {
            socialId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            phone: randomePhone,
            password: randomePassword,
         };
         try {
            const user = await User.findOne({
               $or: [
                  { email: profile.emails[0].value },
                  { socialId: profile.id },
               ],
            });
            a;
            if (user) {
               done(null, user);
            } else {
               const createdNewUser = new User(newUser);
               await createdNewUser.save();
               done(null, createdNewUser);
            }
         } catch (err) {
            console.error(err);
            done(err, false);
         }
      }
   )
);

//serialize and deserilize user
passport.serializeUser((user, done) => {
   done(null, user);
});
passport.deserializeUser(function (user, done) {
   done(null, user);
});
