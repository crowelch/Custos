var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../config/secrets');
var mongoClient = require('mongodb').MongoClient;

/**
 * GET /login
 * Login page.
 */
exports.getLogin = function (req, res) {
  if (req.user) return res.redirect('/');
  console.log('csrfToken = ' + req.csrfToken());
  res.render('account/login', {
    title: 'Login',
    _csrf: req.csrfToken()
  });
};

/**
 * GET /usermanagement
 * User Management Console
 */
 
exports.getUserManagement = function (req, res) {
	var usersCollection;
	getCollection("users", function (err, userCollection) {
		if (err) { return console.log(err); }
		usersCollection = userCollection;
		res.render('partials/usermanagement', {
			title: 'User Management Portal',
			_csrf: req.csrfToken(),
			users: usersCollection
		});
	});
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};



/**
 * POST /usermanagement
 * Create a new local account.
 */
exports.createUser = function(req, res, next) {
	var user = new User( {
		email: req.body.userEmail,
		mNumber : req.body.mNumber,
	profile: { roleName : req.body.roleName },
	password: 'curtiscurtis',
	isAdmin: false,
	isSiteAdmin: true
	});

  User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
          req.flash('error', { msg: 'Account already exists' });
           res.send({ redirect: '/userManagement' });
    }
    user.save(function(err) {
        if (err) return next(err);
        req.flash('success', { msg: 'Account was created successfully.' });
         res.send({ redirect: '/userManagement' });
    });
  });
 
};

exports.transferOwnership = function (req, res) {
	var transferTarget = req.body.transferUsername;
	var targetUser;
	
	User.findOne({ email: transferTarget }, function (err, transferTargetUser) {
		if (err) return console.log(err);
		targetUser = transferTargetUser;
	});
	

	
	if (targetUser) {
		targetUser.isSiteAdmin = true;
		targetUser.isSiteOwner = true;
		targetUser.save(function (err) {
				if (err) { 
					req.flash('error', { msg: 'Ownership Transfer Failed.' });
					return res.send({ redirect: '/' });
				}
			req.flash('success', { msg: 'Ownership Transfer Complete.' });
			revokeUserOwnership(req.user);
				return res.send({ redirect: '/' });
			});
	}
};


function revokeUserOwnership(user) {
	user.isSiteAdmin = false;
	user.isSiteOwner = false;
	user.save(function (err) {
		if (err) console.log(err);
	});
}

exports.updateUserPermissions = function (req, res, next) {
	var userId = req.body.userId;
	var roleName = req.body.roleName;
	
	User.findById(req.body.userId, function (err, user) {
		if (err) return next(err);
		if (roleName === "SiteAdmin") {
		    user.isSiteAdmin = true;
		}
		else { 
			user.isSiteAdmin = false;
		}
		user.profile.roleName = roleName;
		user.save(function (err) {
			if (err) return next(err);
			req.flash('success', { msg: 'Profile information updated.' });
			res.send({ redirect: '/userManagement' });
		});
	});
		
}

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management',
    _csrf: req.csrfToken()
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
		user.email = req.body.email || '';
		user.profile.fullName = req.body.fullName || '';
		user.profile.displayName = req.body.displayName || '';
		user.mNumber = 'M01234567';

		 if (user.isSiteAdmin) {
			user.profile.roleName = "siteAdmin";
		}
		else {
			user.profile.roleName = "User";
		}

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = function (req, res, next) {
  User.remove({ _id: req.body.userId }, function(err) {
    if (err) return next(err);
    req.flash('info', { msg: 'the account has been deleted.' });
    res.send({ redirect: '/userManagement' });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset',
        _csrf: req.csrfToken()
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password',
    _csrf: req.csrfToken()
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that email address exists.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};


function getCollection(collectionName, callback) {
	mongoClient.connect("mongodb://localhost:27017/custos", function (error, db) {
		if (error) {
			console.log(error);
			return callback(err);
		}
		
		db.collection(collectionName).find().toArray(function (err, document) {
			if (!err) {
				return callback(null, document);
			}
			return callback(err);
		});		
	});
}