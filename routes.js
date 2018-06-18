//require all necessary modules
var express = require("express");
var User = require("./models/user");
var passport = require("passport");

//create a router
var router = express.Router();


//middleware for setting variables accessable in the views
router.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("info");
	next();
});

//get route for the root
router.get("/", function(req, res, next) {
	//runs a query through the find method. this returns all users.
	//.sort sorts the user based on the createdAt property of the document/record
	User.find().sort({createdAt: "descending"}).exec(function(err, users) {
		//if an error occurs returns the error to the next middleware in que.
		//no error handeling middleware is defined in this app
		if(err) {return next(err);}
		//if all is good passes the users array to index page and renders it.
		res.render("index", {users: users});
	});
});

//get route for signup page
router.get("/signup", function(req, res) {
	//renders signup page
	res.render("signup");
});

//post route for signup
router.post("/signup", function(req, res, next) {
	//req.body.username and req.body.password comes from the form fields in the signup page and is populated
	//by the bodyparser
	var username = req.body.username;
	var password = req.body.password;

	//on submission this piece tries to determine if the user already
	User.findOne({username: username}, function(err, user) {
		//if an error occurs returns the error to the next middleware in que.
		//no error handeling middleware is defined in this app
		if(err) {return next(err);}
		//if user already exists message is displayed
		if(user) {
			req.flash("error", "user already exists");
			return res.redirect("/signup");
		}

		//if no username is found then new User objectis created. the key shoudl be the same 
		//as defined in the schema
		var newUser = new User({
			username: username,
			password: password
		});
		//saves the user to the database
		newUser.save(next);
	});
}, passport.authenticate("login", {
	successRedirect: "/",
	failureRedirect: "/signup",
	failureFlash: true
}));


//get route for the user specific page
router.get("/users/:username", function(req, res, next) {
	//finds the user
	User.findOne({username: req.params.username}, function(err, user) {
		if(err) {return next(err);}
		if(!user) {return next(404);}
		res.render("profile", {user: user})
	});
});

//get route for login page
router.get("/login", function(req, res) {
	res.render("login");
});

//post router for login.
//calls passport.authenticate with login and goes to setuppassport 
router.post("/login", passport.authenticate("login", {
	successRedirect: "/",
	failureRedirect: "/login",
	failureFlash: true
}));


//get route for logout. 
//calls logout on req object. Passport logouts the user 
router.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/");
});


//defines a function to ensure the user is authenticated before allowing certain operations on data
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		next();
	} else {
		req.flash("info", "You must be logged in to see this page");
		res.redirect("/login");
	}
}

//get router for edit.
//calls ensureAuthenticated to make sure user is authenticated before viewing edit page
router.get("/edit", ensureAuthenticated, function(req, res) {
	res.render("edit");
});

//post router for edit.
//calls ensureAuthenticated to make sure user is authenticated before editing information
router.post("/edit", ensureAuthenticated, function(req, res, next) {
	req.user.displayName = req.body.displayName;
	req.user.bio = req.body.bio;
	req.user.save(function(err) {
		if(err) {
			next(err);
			return;
		}
		req.flash("info", "Profile updated");
		res.redirect("/edit");
	});
});

//exports router
module.exports = router;