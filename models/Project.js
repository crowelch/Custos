var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mongoose = require('mongoose');


var projectSchema = new mongoose.Schema({
	name: { type: String },
	users : { type: [String] },
	items: { type: [String] },
	isActive: {type: Boolean}
	});