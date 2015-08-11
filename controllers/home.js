var User = require('../models/User');
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