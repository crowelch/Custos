var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mongoose = require('mongoose');



var itemSchema = new mongoose.Schema({
	name: { type: String },
	location: { type: String },
	canBorrow: { type: Boolean },
	userId: { type: String, default: null },
	projectId: {type: String, default: null}
});