var auth = require('../../../lib/auth');
var _ = require('underscore');
var fs = require('fs');
var imgur = require('imgur');

imgur.setClientId('b67dffd2dbe1ea5');

/**
 * Takes an req parameter and res parameter and returns the details of a particular employee.
 *
 * @param req The req parameter used to access the database,
 * @returns title, fname, lname, password, phone, email, smsNotify, emailNotify
 */
exports.get = function (req,res) {
	var eid = req.user[0]._id;
    var businessID = req.user[0].business;
    var db = req.db;
    var employees = db.get('employees');
    var businesses = db.get('businesses');

    businesses.findOne(businessID,
        function (err, business){
            if(err){
                return next(err);
            }

            render(req, res, {
                message: req.flash("permission"),
            });

        }
    );


};

/**
 * Takes an req parameter and res parameter and returns the details of a particular employee. The user
 * is then prompted to change any of the information presented.
 *
 * @param req The req parameter used to access the database,
 * @returns title, fname, lname, password, phone, email, smsNotify, emailNotify
 */
exports.post = function (req, res) {


    var db = req.db;
    var employees = db.get('employees');
    var eid = req.user[0]._id;

    var inputOldPass = req.body.oldPassword;
    var inputPass    = req.body.editPassword;
    var inputPass2   = req.body.editPassword2;
    var inputName    = req.body.editName;
    var inputEmail   = req.body.editEmail;
    var inputPhone   = req.body.editPhone;
    var textNotify   = req.body.sendText;
    var emailNotify  = req.body.sendEmail;

    if (inputPass != null)
    {
        hashedInputPass = auth.hashPassword(inputPass);
        if (inputPass != inputPass2) {
            render(req, res, {
                alert: 'Passwords do not match'
            })
            return;
        } else {

            employees.find({_id: eid}, function (err2, result) {
                var emp = result[0];
                if (!auth.validPassword(emp.password, inputOldPass)) {
                    render(req, res, {
                        alert: 'Incorrect password'
                    })
                    return;
                } else {

                    employees.findAndModify({_id: eid}, {$set: {password: hashedInputPass}}, function (err, data) {
                        if (err) {
                            return handleError(res, err);
                        }

                        render(req, res, {
                            edited: 'Password successfully changed!'
                        });
                        return;
                    });
                }
            })
        }
    }

    if (inputPhone != null || inputEmail != null || inputName != null)
    {



        var setContactInfo = {};

        if (inputPhone != null) {
            inputPhone = inputPhone.replace(/-/g, '');
            if (inputPhone.length === 10) {
                inputPhone = '1' + inputPhone;
            } else {
                render(req, res, {
                    alert: 'Incorrect phone number format'
                });
                return;
            }
            setContactInfo.phone = inputPhone;
        }

        if (inputEmail != null) {
            setContactInfo.email = inputEmail;
        }

        if (inputName != null) {
            var splitName = inputName.split(' ');
            if (splitName.length === 2) {
                setContactInfo.fname = splitName[0];
                setContactInfo.lname = splitName[1];
            } else {
                render(req, res, {
                    alert: 'Please format name as <firstname> <lastname>'
                });
                return;
            }
        }

        employees.findAndModify({_id: eid}, { $set: setContactInfo}, function(err, data)
        {
            if (err) { return handleError(res, err);}


            render(req, res, {
                edited: 'Contact info saved.'
            });
            return;
        });
    }

    if (textNotify != null)
    {
        if (textNotify === '0')
        {
            var smsSet = false;
        }
        else
        {
            var smsSet = true;
        }

        employees.findAndModify({_id: eid}, { $set: {smsNotify: smsSet}}, function(err, data)
        {
            if (err) { return handleError(res, err);}

            render(req, res, {
                edited: 'SMS notification settings successfully changed!'
            });
        });
    }

    if (emailNotify != null)
    {
        if (emailNotify === '0')
        {
            var emailSet = false;
        }
        else
        {
            var emailSet = true;
        }
	    //find the appropriate employee to set the email and notification settings
        employees.findAndModify({_id: eid}, { $set: {emailNotify: emailSet}}, function(err, data)
        {
            if (err) { return handleError(res, err);}

                render(req, res, {
                    edited: 'Email notification settings successfully changed!'
                });
        });
    }

};

exports.setCompanyInfo = function (req, res) {


    var db = req.db;
    var businesses = db.get('businesses');
    var bid = req.user[0].business;

    var companyName = req.body.companyName;
    var phone = req.body.phone;


    if (companyName != null || phone != null)
    {

        var setCompanyInfo = {};

        if (phone != null) {
            phone = phone.replace(/-/g, '');
            if (phone.length === 10) {
                phone = '1' + phone;
            } else {
                render(req, res, {
                    alert: 'Incorrect phone number format'
                });
                return;
            }
            setCompanyInfo.phone = phone;
        }

        if (companyName != null) {
            setCompanyInfo.companyName = companyName;
        }

        businesses.update({_id: bid}, { $set: setCompanyInfo}, function(err, data)
        {
            if (err) { return handleError(res, err);}


            render(req, res, {
                edited: 'Company info saved.'
            });
            return;
        });
    }

};


exports.uploadLogo = function(req, res, next){

    var db = req.db;
    var businesses = db.get('businesses');
    var businessID = req.user[0].business;

    if(req.files.userLogo){

        businesses.findOne(businessID,
            function (err, results){

                if(err){
                    return next(err);
                }

                fs.unlink('public/'+results.logo);
            }
        );
        imgur.uploadFile(req.files.userLogo.path)
            .then(function (json) {
                businesses.updateById(businessID, {
                        $set: {
                            logo: json.data.link
                        }
                    },{
                        upsert: true
                    }, function (err){
                        if (err) {
                            return next(err);
                        }

                        render(req, res, {
                            edited:'Succesfully uploaded file: '+req.files.userLogo.originalname,
                            logo: json.data.link
                        });
                    }

                );
            })
            .catch(function (caughtErr) {
                return next(caughtErr);
            });

    } else {
        businesses.findOne(businessID,
            function (err, results){
                if(err){
                    return next(err);
                }

                if(results.logo){

                    render(req, res, {
                        alert:'Please select a valid image(png,jpg) file to upload.'
                    });
                }
                else{
                    render(req, res, {
                        alert:'Please select a valid image(png,jpg) file to upload.'
                    });
                }
            }
        );
    }

};


/**
 * Helper function to render the settings page
 *
 * @param req
 * @param res
 * @param additionalFields An object with the different fields to render (e.g. alert or message)
 */
function render(req, res, additionalFields) {
    var eid = req.user[0]._id;
    var businessID = req.user[0].business;
    var db = req.db;
    var employees = db.get('employees');
    var businesses = db.get('businesses');

    businesses.findOne(businessID,
        function (err, business){
            if(err){
                return next(err);
            }

            //calls find method to find the correct employee to pull results
            employees.find({_id: eid}, function (err2, result) {
                var emp = result[0];
                var phone = emp.phone;
                phone = phone.replace('1', '');
                        phone = phone.slice(0, 3) + '-' + phone.slice(3, 6) + '-' + phone.slice(6);
                var companyPhone = business.phone;
                companyPhone = (companyPhone.length === 11) ? companyPhone.replace('1', '') : companyPhone;
                        companyPhone = companyPhone.slice(0, 3) + '-' + companyPhone.slice(3, 6) + '-' + companyPhone.slice(6);


                var defaultFields = {
                    settings: 'active',
                    title: 'Settings',
                    fname: emp.fname,
                    lname: emp.lname,
                    employeeName: emp.fname+' '+emp.lname,
                    isAdmin: emp.admin,
                    password: emp.password,
                    phone: phone,
                    email: emp.email,
                    smsNotify: emp.smsNotify,
                    emailNotify: emp.emailNotify,
                    admin: emp.admin,
                    logo: business.logo ? business.logo : null,
                    bg: business.style.bg ? business.style.bg : null,
                    companyName: business.companyName,
                    companyPhone: companyPhone
                };

                var allFields = _.extend(defaultFields, additionalFields);

                if( req.user[0].peter ) {
                    _.extend(allFields, {
                        layout: 'admin'
                    });
                } else {
                    _.extend(allFields, {
                        isOwner: req.user[0].admin,
                        businessId: req.user[0].business
                    });
                }

                res.render('business/accountsettings', allFields);
            });
        }
    );
}
