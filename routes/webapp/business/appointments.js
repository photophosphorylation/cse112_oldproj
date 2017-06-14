var Appointment = require('../../../model/appointments.js');
var Customer = require('../../../model/customers.js');
var Business = require('../../../model/businesses.js');

var PythonShell = require('python-shell');
var async = require('async');
var ObjectId = require('mongodb').ObjectID;

exports.get = function(req, res){
  var database = req.db;
  var appointmentDB = database.get('appointments');
  var appointment;
  var todayApts;
  var missedApts;
  var businessID = req.user[0].business.toString();

  var tmrwDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  var day = tmrwDate.getDate();
  var month = tmrwDate.getMonth();
  var year = tmrwDate.getFullYear();
  tmrwDate = new Date(year, month, day);

  var currDate = new Date(new Date().getTime());
  day = currDate.getDate();
  month = currDate.getMonth();
  year = currDate.getFullYear();
  currDate = new Date(year, month, day);
  console.log(currDate);
  console.log(tmrwDate);

  async.parallel({
    appointment: function(cb) {
      appointmentDB.find({
        registrationToken: {$exists: false},
        business: ObjectId(businessID)
      }, function (err,results){
        if( err ) { return next(err); }
        if( !results ) { return next(new Error('Error finding appointment')); }
        appointment = results.sort(function(a,b){
          return new Date(a.aptTime) - new Date(b.aptTime);
        });
        cb();
      });
    },
    todayApts: function(cb) {
      appointmentDB.find({
        aptTime: {'$gte': currDate, '$lte': tmrwDate},
        registrationToken: {$exists: false},
        business: ObjectId(businessID)
      }, function (err,results){
        if( err ) { return next(err); }
        if( !results ) { return next(new Error('Error finding appointment')); }
        todayApts = results.sort(function(a,b){
          return new Date(a.aptTime) - new Date(b.aptTime);
        });
        cb();
      });
    },
    missedApts: function(cb) {
      appointmentDB.find({
        missed: true,
        registrationToken: {$exists: false},
        business: ObjectId(businessID)
      }, function (err,results){
        if( err ) { return next(err); }
        if( !results ) { return next(new Error('Error finding appointment')); }
        missedApts = results.sort(function(a,b){
          return new Date(a.aptTime) - new Date(b.aptTime);
        });
        cb();
      });
    }
  },
    function(err,results){

      if(err){
        throw err;
      }
      if(req.session.failure === undefined){
        res.render('business/appointments', {
          title: 'Appointments',
          appointments: appointment,
          todayApts: todayApts,
          missedApts: missedApts,
		      employeeName: req.user[0].fname + ' ' + req.user[0].lname,
          isOwner: req.user[0].admin,
          businessId: req.user[0].business
        });
      }
      else{
        res.render('business/appointments', {
          title: 'Appointments',
          appointments: appointment,
		      employeeName: req.user[0].fname + ' ' + req.user[0].lname,
          todayApts: todayApts,
          missedApts: missedApts,
          isOwner: req.user[0].admin,
          businessId: req.user[0].business,
          message: "Customer does not exist!"
        });
      }
      req.session.failure = undefined;
   }
 );
};

exports.post = function(req, res, next){
  var businessID = req.user[0].business;
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
      res.redirect('/appointments');
    }
    else{
      var currDate = new Date();
      var aptTime = new Date(req.body.aptTime);
      var timeDiff = Math.abs(aptTime - currDate);
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      console.log(customer.age);
      console.log(aptTime.getDay());
      console.log(diffDays);
      var options = {
        scriptPath: __dirname,
        args: [customer.age,
               1,
               aptTime.getDay(),
               0,
               diffDays]
      }
      PythonShell.run('predict.py', options, function (err, results) {
        console.log(results);
        prob = parseFloat(results);
        console.log(prob);
        var sms =false;
        if (prob < 0.5) {
          sms = true;
        }

        var appointment = new Appointment({
          business: businessID,
          customer: customer,
          customerFirstName: custFirstName,
          customerLastName: custLastName,
          phone: customer.phone,
          email: customer.email,
          customerAge: custAge,
          aptTime: req.body.aptTime,
          createdOn: Date.now(),
          reminder: sms
        });
        appointment.save(function(err) {
          console.log("Saving");
          if (err) {
            console.log(err);
          }
        });
        res.redirect('/appointments');
      });
      /*var child = spawn('python',["../../../ml/predict.py",
                                    '' + customer.age,
                                    'M',
                                    '' + aptTime.getDay(),
                                    '0',
                                    '' + diffDays]);*/
    }
  });
};
