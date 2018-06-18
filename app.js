var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
//require all necessary modules
var flash = require("connect-flash");
var passport = require("passport");
var setUpPassport = require("./setuppassport");

//imports router
var routes = require("./routes");

//creates express app
var app = express();

//connect to db
mongoose.connect("mongodb://localhost:27017/app");

//calls the function in the setuppassport file for authentication
setUpPassport();


//sets application port
app.set("port", process.env.PORT || 3000);

//sets the viewing engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware for bodyparser for populating the form fields
app.use(bodyParser.urlencoded({extended: false}));

//middle for cookie parsing
app.use(cookieParser());

//session middleware
app.use(session({
	secret: "enter any arbitrary value here",
	resave: true,
	saveUninitialized: true
}));

//flash middleware for messages
app.use(flash());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//routes middleware. loads the routes.js where all the routes live
app.use(routes);

//starts server on designated port
app.listen(app.get("port"), function() {
	console.log("Server started at port " + app.get("port"));
})





