//require all necessary modules
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

//require the model 
var User = require("./models/user");

//definition of the export function. referenced as setupPassport() in app.js
module.exports = function() {

	//serializer: this piece converts the user object to an ID. 
	//this is done through translating user to session with the unique ID
	//which is the username property of every user 
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	//deserializer: this converts the ID into a user object
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user){
			done(err, user);	
		});	
	});
};

//this fires everytime the user requests login. This also sets a 
//authentication strategy which is set to local.
//the body of thge method defines thge strategy.
//called in the login post route
passport.use("login", new LocalStrategy(function(username, password, done) {
	//The user with the username is found
	User.findOne({username: username}, function(err, user) {
		if(err) {return done(err);}
		if(!user) {return done(null, false, {message: "No user by that username"});
		}
		//provided password is checked with the checkpassword method defined in the model (user.js)
		user.checkPassword(password, function(err, isMatch) {
			if(err) {return done(err);}
			if(isMatch) {return done(null, user);}
			else {return done(null, false, {message: "Invalid password"})}

		});
	});
}));
