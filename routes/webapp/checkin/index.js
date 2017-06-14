var express = require('express');
var router = express.Router();

//Define the controllers for checkin process
var checkin = require('./checkin');
var done = require('./done');
var main = require('./main');
var appointments = require('./appointments');

//Setup the routes
router.get('/:id/checkin', updateBusiness, checkin.get);
router.post('/:id/checkin', updateBusiness, checkin.post);

router.get('/:id/main', updateBusiness, main.get);
router.get('/:id', updateBusiness, main.get);

router.get('/:id/appointments', updateBusiness, appointments.get);
router.post('/:id/appointments', updateBusiness, appointments.post);

router.get('/:id/done', updateBusiness, done.get);

module.exports = router;

/**
 * Middleware to ensure that req.session.business contains info about the current business
 */
function updateBusiness(req, res, next) {
    //Simple case: first time on the page
    if (!req.session.business) {
        req.db.get('businesses').findOne(req.params.id, function (err, business) {
            if (err) {
                return next(err);
            }
            req.session.business = business;
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                next();
            });
        });
    } else if (req.session.business._id !== req.params.id) {
        //This means the business was switched which could be part of a security attack
        //Destroy the session and then get the new business to be safe
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            }
            req.db.get('businesses').findOne(req.params.id, function (err, business) {
                if (err) {
                    return next(err);
                }
                req.session.business = business;
                req.session.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    next();
                });
            });
        });
    } else { //Everything looks good, do nothing
        //next();
        req.db.get('businesses').findOne(req.params.id, function (err, business) {
            if (err) {
                return next(err);
            }
            req.session.business = business;
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                next();
            });
        });
    }
}
