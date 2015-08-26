var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mongoose = require('mongoose');

var toolSchemaa = new mongoose.Schema({
		name: { type: String },
		location: { type: String }
});
