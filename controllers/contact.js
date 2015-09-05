var secrets = require('../config/secrets');
var nodemailer = require("nodemailer");
var sgTransporter = require("nodemailer-sendgrid-transport");

var options = {
    auth: {
        api_key : secrets.sendgrid.apiKey
    }
}

var mailer = nodemailer.createTransport(sgTransporter(options));


exports.postContact = function(req, res) {
  req.assert('emailSubject', 'Subject cannot be blank').notEmpty();
  req.assert('userEmail', 'Email is not valid').isEmail();
  req.assert('emailBody', 'Message cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    res.send({ redirect: '/userManagement' });
  }

  var userMessage = {
    to: req.body.userEmail,
    from: req.user.email,
    subject: req.body.emailSubject,
    text: req.body.emailBody
  }
  
  mailer.sendMail(userMessage, function(err, resp){
    if(err){
      req.flash('errors', { msg: err.message });
    }
    else{
           req.flash('success', { msg: 'Email has been sent successfully!' });
    }
    res.send({ redirect: '/userManagement' });
  });
};


exports.forgotPassword = function (req, res) { 



};