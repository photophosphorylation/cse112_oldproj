var auth = require('../../../lib/auth');
var async = require('async');
var appointment = require('../../../Model/Appointment')

exports.test = function(req, res) {
    appointment(req,res)
}