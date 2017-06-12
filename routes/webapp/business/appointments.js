var Customer = require('../../../model/customers.js')
var Business = require('../../../model/businesses.js')

exports.get = function(req,res){
  res.render('business/appointments', {
    title: 'Appointments',
    message: req.flash("permission"),
    layout: 'main',
  });
};

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
