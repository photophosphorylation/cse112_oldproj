/**
 * Loads express module for ExpressJS and establishes router object.
 */
var express = require('express');
var router = express.Router();

/**
 * Loads modules for check-in operations:
 * appointmentsToday,setApptState, formResponse, signature
 */
var appointmentsToday = require('./appointmentstoday');
var setApptState = require('./set_appt_state');
var botWebhook = require('./botwebhook');

/**
 * Routes get request for url /employee/:eid/appointments/today to the get
 * method in the appointmentsToday module, which shows all appointments for
 * today for the given employee id, :eid.
 */
router.get('/employee/:eid/appointments/today', appointmentsToday.get);

/**
 * Routes put request for url /appointemnts/:id/state to the put method in the
 * setApptState module, which updates the state for the given appointment id,
 * :id, as necessary.
 */
router.put('/appointments/:id/state', setApptState.put);


/**
 * Exports router with new handlers when module is exported.
 */
module.exports = router;
