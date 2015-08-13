var secrets = require('../config/secrets');
var nodemailer = require("nodemailer");
var sgTransporter = require("nodemailer-sendgrid-transport");

var options = {
    auth: {
        api_key : secrets.sendgrid.apiKey
    }
}

var mailer = nodemailer.createTransport(sgTransporter(options));

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = function(req, res) {
  req.assert('emailSubject', 'Subject cannot be blank').notEmpty();
  req.assert('userEmail', 'Email is not valid').isEmail();
  req.assert('emailBody', 'Message cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    res.send({ redirect: '/userManagement' });
  }

  var from = req.user.email;
  var name = req.user.profile.fullName;
  var body = req.body.emailBody;
  var to = req.body.userEmail;
  var subject = req.body.emailSubject;

  var mailOptions = {
    to: to,
    from: from,
    subject: subject,
    text: body
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      req.flash('errors', { msg: err.message });
      res.send({ redirect: '/userManagement' });
    }
    req.flash('success', { msg: 'Email has been sent successfully!' });
    res.send({ redirect: '/userManagement' });
  });
};