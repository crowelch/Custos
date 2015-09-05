var User = require('../models/User');
var Document = require('../lib/document');
/**
 * GET /
 * Home page.
 */
exports.index = function (req, res) {
	res.render('partials/dashboard',{
		title: 'Home',
		userName: req.user.profile.fullName;
  });
};

exports.generateReimbursementForm = function (req, res) { 
	Document.renderReimbursementForm();

};

exports.generatePurchaseOrder = function (req, res) { 
	Document.renderPurchaseOrder();
};