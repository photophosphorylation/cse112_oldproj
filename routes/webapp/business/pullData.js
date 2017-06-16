var auth = require('../../../lib/auth');
var async = require('async');
var appointments = require('../../../model/appointments.js');

exports.get = function(req, res) {
  var db = req.db;
  console.log(req.user[0].business);
  appointments.find({'business': req.user[0].business}).populate('customer business').exec(function (err, appointments) {
    if (err) {
        // Note that this error doesn't mean nothing was found,
        // it means the database had an error while searching, hence the 500 status
        res.status(500).send(err);
    } else {
        // send the list of all people
        console.log(req.user[0].business);
        res.send(appointments);
    }
  });
}
