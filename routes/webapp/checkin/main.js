var ObjectID = require('mongodb').ObjectID;
var style = require('./../../../lib/style.js');
var request = require('request');

exports.get = function (req, res) {

    var business = req.session.business;

    res.render('checkin/main', {
        businessId: business._id,
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
