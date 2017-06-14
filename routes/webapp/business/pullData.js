var auth = require('../../../lib/auth');
var async = require('async');
var appointments = require('../../../model/appointments.js');

exports.get = function(req, res) {
  var db = req.db;
  appointments.find().populate('customer business').lean().exec(function (err, appointments) {
    if (err) {
        // Note that this error doesn't mean nothing was found,
        // it means the database had an error while searching, hence the 500 status
        res.status(500).send(err)
    } else {
        // send the list of all people
        res.send(appointments);
    }
  });
}



//   getAppointments = appointments.find({"Missed": false}).exec().then(function(appointments){
//     result.appointments = appointments;
//   });
//
//   getBusinesses = businesses.find({"walkins": false}).exec().then(function (businesses) {
//     result.businesses = businesses;
//   });
//
//   getCustomers = customers.find({"__v": 0}).exec().then(function (customers) {
//     result.customers = customers;
//   });
//
//   Q.all([
//     getAppointments,
//     getBusinesses,
//     getCustomers
//   ])
//   .then(function() {
//     res.send(result);
//   })
//   .catch(function(err) {
//     res.status(500).send(err);
//   })
//   .done()
// }

//   promise.then(function (appointments) {
//     var appointmentsData = appointments;
//     console.log(appointmentsData);
//     result[0].push(appointmentsData);
//     return result; // returns a promise
//   })
//   .then(function(result) {
//     var businessesData = businesses;
//     console.log(businessesData);
//     result[1].push(businessData);
//     return result;
//   })
//   .then(function(result) {
//     var customersData = customers;
//     console.log(customersData);
//     result[2].push(customersData);
//     return result;
//   })
//   .catch(function(err){
//     console.log('error:', err);
//     res.status(500).send(err)
//   });
//   console.log(result);
//   res.send(result);
