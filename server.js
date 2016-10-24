"use strict";

function loginPage(req, res) {
  res.render("authTemplates/login", { messages: req.flash("error")[0] });
}

var express = require("express");
var app = express();
var passport = require("passport");
var session = require("express-session");
var encrypt = require("./lib/encrypt_pw");
var flash = require("connect-flash");
var gallery = require("./routes/gallery");
var bodyParser = require("body-parser");
var analyticTrack = require("./lib/analytics_track");
var port = process.env.PORT || 3000;
var config = (function whatSecret() {
  if ( process.env.NODE_ENV == "production" ) {
    return { "secret": process.env.SECRET };
  } else {
    return require("./config/config.json");
  }
})();

require("./sec/passport.js");

app.set("view engine", "jade");
app.set("views", "./templates");

app.use(
  express.static("public"),
  bodyParser.urlencoded( { extended: true } ),
  bodyParser.json(),
  session( { secret: config.secret } ),
  passport.initialize(),
  passport.session(),
  flash()
);
app.use("/gallery", gallery);

app.get("/", loginPage);

app.route("/login")
.get(loginPage)
.post(passport.authenticate("local", {
    successRedirect: "/gallery",
    failureRedirect: "/login",
    failureFlash: true,
}));

app.route("/register")
.get(function registerPage(req, res) {
  res.render("./authTemplates/register");
})
.post(function registerUser(req, res) {
  encrypt(req, res, 10, req.body.password);
});

app.get("/logout", function logout(req, res) {
  req.logout();
  res.redirect("/login");
});

app.listen(port, function sequelizeDb() {
  var db = require("./models");
  db.sequelize.sync();
});
