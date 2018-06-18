
//require all necessary modules
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;

//creates the schema. Defines the schema of for the User collection
var userSchema = mongoose.Schema({
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	createdAt: {type: Date, default: Date.now},
	displayName: String,
	bio: String
});


var noop = function() {};

//defines a presave action to encrypt the password
userSchema.pre("save", function(done) {
	var user = this;
	if(!user.isModified("password")) {
		return done();
	}

//encrypts the password
	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
		if(err) {return done(err);}
		bcrypt.hash(user.password, salt, noop, function(err, hashedPassword) {
			if(err) {return done(err);}
			user.password = hashedPassword;
			done();
		});
	});
});

//compares password to the guess
userSchema.methods.checkPassword = function(guess, done) {
	bcrypt.compare(guess, this.password, function(err, isMatch) {
		done(err, isMatch);
	});
};

//getter for name roperty of the document/record in the User schema
userSchema.methods.name = function() {
	return this.displayName || this.username;
};

//getter for the bio property of the document/record in the User schema
userSchema.methods.getbio = function() {
	return this.bio || " ";
};

var User = mongoose.model("User", userSchema);

module.exports = User;
