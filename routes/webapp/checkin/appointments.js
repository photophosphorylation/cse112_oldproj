var Appointment = require('../../../model/appointments.js');
var Customer = require('../../../model/customers.js');
var Business = require('../../../model/businesses.js');

var async = require('async');
var ObjectId = require('mongodb').ObjectID;
var style = require('./../../../lib/style.js');

exports.get = function(req, res){
  var business = req.session.business;

  if(req.session.failure === undefined){
    res.render('checkin/appointments', {
        companyName: business.companyName,
        businessId: business._id,
        bg: business.style.bg,
        logo: business.logo,
        buttonBg: style.rgbObjectToCSS(business.style.buttonBg),
        buttonText: style.rgbObjectToCSS(business.style.buttonText),
        containerText: style.rgbObjectToCSS(business.style.containerText),
        containerBg: style.rgbObjectToCSS(business.style.containerBg),
        layout: false
    });
  }
  else{
    res.render('checkin/appointments', {
        companyName: business.companyName,
        businessId: business._id,
        bg: business.style.bg,
        logo: business.logo,
        buttonBg: style.rgbObjectToCSS(business.style.buttonBg),
        buttonText: style.rgbObjectToCSS(business.style.buttonText),
        containerText: style.rgbObjectToCSS(business.style.containerText),
        containerBg: style.rgbObjectToCSS(business.style.containerBg),
        layout: false,
        error: "Customer does not exist!"
    });
  }
  req.session.failure = undefined;


};

exports.post = function(req, res){
  var businessID = req.session.business;
  var custFirstName = req.body.customerFirstName;
  var custLastName = req.body.customerLastName;
  var custAge = req.body.customerAge;
  Customer.findOne({
    business: businessID,
    firstName: custFirstName,
    lastName: custLastName,
    age: custAge})
  .exec(function(err, customer) {
    if (customer === null){
      req.session.failure = true;
      res.redirect('back');
    }
    else{
      var appointment = new Appointment({
        business: businessID,
        customer: customer._id,
        customerFirstName: custFirstName,
        customerLastName: custLastName,
        phone: customer.phone,
        email: customer.email,
        customerAge: custAge,
        aptTime: req.body.aptTime,
        createdOn: Date.now()
      });
      appointment.save(function(err) {
        console.log("Saving");
        if (err) {
          console.log(err);
        }
      });
      res.redirect('.');
    }
  });
};
