const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../models");
const bcrypt = require("bcrypt");

module.exports = (function secModule() {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      db.User.findOne( { where: { username: username } } )
      .then(function(data) {
        var passHash;
        bcrypt.compare(password, data.dataValues.password, (err, res) => {

          passHash = res;

          if(data.dataValues.username !== username) {
            return done(null, false, { message: "Incorrect username." });
          }
          if(!passHash) {
            return done(null, false, { message: "Incorrect password." });
          }
          return done(null, data);
        });
      });
    }
  ));

  //Assign cookie to browser for continued use
  passport.serializeUser((user, done) => {
    return done(null, user);
  }); //Assign id/cookie to browser for continued use

  //Remove cookie from browser
  passport.deserializeUser((user, done) => {
    return done(null, user);
  });
})();
