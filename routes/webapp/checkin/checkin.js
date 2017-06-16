var ObjectID = require('mongodb').ObjectID;
var style = require('./../../../lib/style.js');

var request = require('request');

var Appointments = require('../../../model/appointments.js');
var Customers = require('../../../model/customers.js');

exports.get = function (req, res) {

  var business = req.session.business;

  res.render('checkin/checkin', {
    companyName: business.companyName,
    bg: business.style.bg,
    logo: business.logo,
    buttonBg: style.rgbObjectToCSS(business.style.buttonBg),
    buttonText: style.rgbObjectToCSS(business.style.buttonText),
    containerText: style.rgbObjectToCSS(business.style.containerText),
    containerBg: style.rgbObjectToCSS(business.style.containerBg),
    layout: false
  });
};

exports.post = function (req, res, next) {

  var business = req.session.business;

  var inputFirst = req.body.inputFirst;
  var inputLast = req.body.inputLast;
  var inputPhone = req.body.inputPhone.replace(/[\(\)-\s]/g, '');


  console.log(ObjectID(req.params.id));
  console.log(inputFirst);
  console.log(inputLast);
  console.log(inputPhone);
  console.log("Finding Customer");

  Customers.findOne({
    //business: ObjectID(req.params.id),
    firstName: inputFirst,
    lastName: inputLast,
    phone: inputPhone
  }).exec(function(err, customer) {
    if (customer === null) {
      res.render('checkin/checkin', {
        error: 'No customer found!',
        inputFirst: inputFirst,
        inputLast: inputLast,
        inputPhone: inputPhone,
        layout: false,
        companyName: business.companyName,
        bg: business.style.bg,
        logo: business.logo,
        buttonBg: style.rgbObjectToCSS(business.style.buttonBg),
        buttonText: style.rgbObjectToCSS(business.style.buttonText),
        containerText: style.rgbObjectToCSS(business.style.containerText),
        containerBg: style.rgbObjectToCSS(business.style.containerBg)
      });
    } else {
      console.log("found!");
      Appointments.find({
        customer: customer,
        checkedIn: false
      }).sort({aptTime: -1})
      .exec(function(err, result) {
        if (result.length === 0) {
          res.render('checkin/checkin', {
            error: 'No appointments found!',
            inputFirst: inputFirst,
            inputLast: inputLast,
            inputPhone: inputPhone,
            layout: false,
            companyName: business.companyName,
            bg: business.style.bg,
            logo: business.logo,
            buttonBg: style.rgbObjectToCSS(business.style.buttonBg),
            buttonText: style.rgbObjectToCSS(business.style.buttonText),
            containerText: style.rgbObjectToCSS(business.style.containerText),
            containerBg: style.rgbObjectToCSS(business.style.containerBg)
          });
        } else {
          result[0].checkedIn = true;
          result[0].save(function(err) {
            console.log("Saving");
            if (err) {
              console.log(err);
            }
          });
          res.redirect('./done');
        }
      });
    }
  });


};

function formatDate (date) {
  var unformattedApptTime = new Date(date);
  var formattedHour = unformattedApptTime.getHours() > 12 ? unformattedApptTime.getHours() % 12 : unformattedApptTime.getHours();
  var formattedMinutes = unformattedApptTime.getMinutes();
  var ampm = unformattedApptTime.getHours() > 12 ? " PM" : " AM";
  var formattedApptTime = formattedHour + ":" + formattedMinutes + ampm;

  return formattedApptTime;
}
