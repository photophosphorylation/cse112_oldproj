var auth = require('../../../lib/auth');
var async = require('async');
var appointments = require('../../../model/appointments.js');
var businesses = require('../../../model/businesses.js');
var customers = require('../../../model/customers.js');

exports.get = function(req, res) {
  var db = req.db;
  appointments.find(function (err, appointments) {
    if (err) {
        // Note that this error doesn't mean nothing was found,
        // it means the database had an error while searching, hence the 500 status
        res.status(500).send(err)
    } else {
        // send the list of all people
        res.send(appointments);
    }
  });
  businesses.find(function (err, businesses) {
    if (err) {
        // Note that this error doesn't mean nothing was found,
        // it means the database had an error while searching, hence the 500 status
        res.status(500).send(err)
    } else {
        // send the list of all business
        res.send(businesses);
    }
  });
  customers.find(function (err, customers) {
    if (err) {
        // Note that this error doesn't mean nothing was found,
        // it means the database had an error while searching, hence the 500 status
        res.status(500).send(err)
    } else {
        // send the list of all customers
        res.send(customers);
    }
  });
}
