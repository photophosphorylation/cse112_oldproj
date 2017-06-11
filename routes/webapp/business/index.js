'use strict';

var express = require('express');
var router = express.Router();

// Define the routes for navigating the dashboard web application
var landing = require('./landing');
var login = require('./login');
var accountSettings = require('./accountsettings');
var register = require('./register');
var dashboard = require('./dashboard');
var addEmployees = require('./addemployees');
var employeeRegister = require('./employeeregister');
var businesssetting = require('./businesssetting');
var formbuilder = require('./forms');
var dbTest = require('./dbTest');
var test = require('./test');

/*
 * TODO: Explain where this export is pointing to.
 */
module.exports = function (passport) {
    //Setup the routes
    router.get('/', landing.get);
    router.post('/', landing.post);

    router.get('/login', login.get);
    router.post('/login', passport.authenticate('local-login',{
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash: true
    }));

    router.get('/accountSettings', isLoggedIn, accountSettings.get);

    /** TEST ROUTER **/
    router.get('/test', isLoggedIn, test.get);
    
    router.post('/accountSettings', isLoggedIn, accountSettings.post);
    router.post('/uploadlogo', isLoggedInBusiness, accountSettings.uploadLogo);

    router.post('/businesssetting', isLoggedInBusiness,accountSettings.setCompanyInfo);

    router.get('/register', register.get);
    router.get('/forms', isLoggedInBusiness, formbuilder.get);
    router.post('/register', passport.authenticate('local-signup', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/register' // redirect back to the signup page if there is an error
    }));

    router.get('/dashboard', isLoggedIn, dashboard.get);
    //router.get('/dbTest',isLoggedIn)
    router.get('/dbTest',isLoggedIn,dbTest.test,dashboard.get);
    router.get('/addemployees', isLoggedInBusiness, addEmployees.get);
    router.post('/addemployees', isLoggedInBusiness, addEmployees.post);

    router.get('/test', isLoggedIn);

    router.get('/employeeregister', employeeRegister.get);
    router.post('/employeeregister', passport.authenticate('local-signup-employee', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/register' // redirect back to the signup page if there is an error
    }));

    function isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }

        res.redirect('/');
    }

    // route middleware to make sure a user is logged in
    function isLoggedInBusiness(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()&& (req.user[0].admin === true)){
            return next();
        }
        req.flash("permission", "You do not have permission to access that page");
        // if they aren't redirect them to the home page
        res.redirect('back');
    }


    return router;
};
