var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://localhost:27017/nodeauth';
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;


// User Schema
var UserSchema = mongoose.Schema({
	companyname: {
		type: String
	},
	eid: {
		type: String
	},
	name: {
		type: String
	},
	password: {
		type: String
	},
	email: {
		type: String,
		unique:true,
	},
	profileimage:{
		type: String
	}
});






var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
   			newUser.password = hash;
   			newUser.save(callback);
    	});
	});
}
