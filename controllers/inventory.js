var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../config/secrets');
var mongoClient = require('mongodb').MongoClient;

/**
 * GET /account
 * Profile page.
 */
exports.getInventory = function (req, res) {
    var userDocs;
    getNumberOfDocuments("users", function (err, numOfDocs) {
        if (err) { return console.log(err);}
		userDocs = numOfDocs;
        res.render('inventory', {
            title: 'Inventory',
            _csrf: req.csrfToken(),
            documentCount: userDocs
        });
    });
};


function getNumberOfDocuments(collectionName, callback) {
    mongoClient.connect("mongodb://localhost:27017/custos", function (error, db) {
        if (error) {
            console.log(error);
            return callback(err);
        }

        db.collection(collectionName).count({}, function (error, numOfDocs) {
            if (error) { return callback(error); }
            db.close();
            callback(null, numOfDocs);
        });
    });
}