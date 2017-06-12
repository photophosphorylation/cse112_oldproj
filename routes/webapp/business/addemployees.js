var crypto = require('crypto');
var baby = require('babyparse');
var async = require('async');
// var sendgrid  = require('sendgrid')('robobetty', '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');
var sendgrid = require('sendgrid')('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');
var ObjectId = require('mongodb').ObjectID;

 /**
 * Takes a req and res parameters and is inputted into function to get employee, notemployee, and business data.
 *
 * @param req and res The two parameters passed in to get the apprporiate employee,
 * @returns The appropriate data about the employee
 */
exports.get = function(req,res){
	    var database =  req.db;
        var employeeDB = database.get('employees');
        var employee;
        var notemployee;
        var businessID = req.user[0].business.toString();

        async.parallel({
            employee: function(cb) {
                employeeDB.find({
                    registrationToken: {$exists: false},
                    business: ObjectId(businessID)
                }, function (err,results){
                        if( err ) { return next(err); }
                        if( !results ) { return next(new Error('Error finding employee')); }

                        employeee = results;
                        cb();
                });
            },
            nonemployee: function(cb) {
                employeeDB.find({
                    registrationToken: {$exists: true},
                    business: ObjectId(businessID)}, function (err,results){

                    if (err) {
                        console.log("Error finding nonemployees")
                        return next(err);
                    }
                    if(!results) {
                        return next(new Error('Error finding employee'));
                    }

                     notemployee = results;
                    //  console.log('Found some not-registered employees');
                    //  console.log(notemployee);
                     cb();
                });
            }
        },

        function(err,results){

            if(err){
                throw err;
            }

            res.render('business/addemployees', {
                title: 'Express',
                notsigned: notemployee,
                signed: employeee,
                isOwner: req.user[0].admin,
                businessId: req.user[0].business,
                employees: "active"
            });

        });
}

/**
 * Takes a req and res parameters and is inputted into function to get employee, notemployee, and business data.
 *  Allows the User to input specified data and make changes
 * @param req and res The two parameters passed in to get the apprporiate employee,
 * @returns The appropriate data about the employee
 */
exports.post = function(req,res,next){

    var database =  req.db;
    var employeeDB = database.get('employees');
    var businessID = req.user[0].business;
    var name = req.body.inputName;
    var inputEmail = req.body.inputEmail;
    var inputPhone = req.body.inputPhone;

    var token = randomToken();

    var salt = crypto.randomBytes(128).toString('base64');
    var password;

    crypto.pbkdf2('password', salt, 10000, 512, function(err, dk) {
        password = dk;
        employeeDB.insert({
            business: businessID,
            fname: name,
            email: inputEmail,
            phone: inputPhone,
            registrationToken : token,
            admin: false,
            // password: password
            // need to create a randomly generated bCrypted Password
        });
        // can't use variables in an object's field. Instead, create the field outside, then put it as the text argument in sendgrid
        var emailContent = 'Hello ' + name + ', \n\n' + 'Please click on the following link, or paste this into your browser to complete sign-up the process: ' + 'http://team-fubar.herokuapp.com/employeeregister?token=' + token;

        sendgrid.send({
            to: inputEmail,
            from: 'test@localhost.com',
            subject: 'Employee Signup',
            text: emailContent
        }, function (err){
            if (err) {
                return next(err);
            }
        });

        res.redirect('/addemployees');
    });
}

function randomToken() {
      return crypto.randomBytes(24).toString('hex');
}
