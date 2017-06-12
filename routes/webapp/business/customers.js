//var expressValidator = require('express-validator');
var Customer = require('../../../model/customers.js')
var Business = require('../../../model/businesses.js')

var async = require('async');
var ObjectId = require('mongodb').ObjectID;

exports.get = function(req,res){
  var database =  req.db;
	var customerDB = database.get('customers');
	var customer;
	var businessID = req.user[0].business.toString();

	async.parallel({
		customer: function(cb) {
			customerDB.find({
				registrationToken: {$exists: false},
				business: ObjectId(businessID)
			}, function (err,results){
				if( err ) { return next(err); }
				if( !results ) { return next(new Error('Error finding customer')); }
				customer = results;
				cb();
			});
		}},

		function(err,results){

			if(err){
				throw err;
			}

			res.render('business/customers', {
				title: 'Customers',
				customers: customer,
				isOwner: req.user[0].admin,
				businessId: req.user[0].business,
			});
	  }
  );
};

/*
* Takes a req and res parameters and is inputted into function to get employee, notemployee, and business data.
*  Allows the User to input specified data and make changes
* @param req and res The two parameters passed in to get the apprporiate employee,
* @returns The appropriate data about the employee
*/
//TODO: Validate the form and send back an error
exports.post = function(req, res, next){
  var businessID = req.user[0].business;
  Business.findOne({ _id: businessID })
  .exec(function(err, business) {
    var customer = new Customer({
      business: business,
      firstName: req.body.inputFirstName,
      lastName: req.body.inputLastName,
      age: req.body.inputAge,
      address: req.body.inputAddress,
      phone: req.body.inputPhone,
      email: req.body.inputEmail,
      createdOn: Date.now()
    });
    customer.save(function(err) {
      console.log("Saving");
      if (err) {
          console.log(err);
      }
    })
    res.redirect('/customers');
  });

}
