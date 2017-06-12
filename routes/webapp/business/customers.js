//var expressValidator = require('express-validator');
var Customer = require('../../../model/customers.js')
var Business = require('../../../model/businesses.js')

exports.get = function(req,res){
  res.render('business/customers', {
    title: 'Customers',
    layout: 'main',
    dashboard: "active"
  });
};

/*
* Takes a req and res parameters and is inputted into function to get employee, notemployee, and business data.
*  Allows the User to input specified data and make changes
* @param req and res The two parameters passed in to get the apprporiate employee,
* @returns The appropriate data about the employee
*/

exports.post = function(req, res, next){
  console.log("FUCKKKKK")
  var businessID = req.user[0].business;
  console.log("Finding Business...");
  console.log(req.body);
  console.log(req.body.inputFirstName);
  console.log(req.body.inputLastName);
  console.log(req.body.inputAge);
  console.log(req.body.inputAddress);
  console.log(req.body.inputPhone);
  console.log(req.body.inputEmail);
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
