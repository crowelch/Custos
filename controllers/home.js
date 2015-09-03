var User = require('../models/User');
var Document = require('../lib/document');
/**
 * GET /
 * Home page.
 */
exports.index = function (req, res) {
	var userDocumentCount;
    User.count(function (e, count) {
        userDocumentCount = count;
    });
	res.render('partials/dashboard',{
		title: 'Home'
  });
};

exports.generateReimbursementForm = function (req, res) { 
	Document.renderReimbursementForm();

};

exports.generatePurchaseOrder = function (req, res) { 
	Document.renderPurchaseOrder();
};