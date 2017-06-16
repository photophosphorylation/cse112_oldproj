var auth = require('../../../lib/auth');
var async = require('async');

exports.get = function (req, res) {
	var db = req.db;
	var businesses = db.get('businesses');

	var isPeter = req.user[0].peter;
	var isOwner = req.user[0].admin;
	var employeeId = req.user[0]._id;
	var email = req.user[0].email;
	var phone = req.user[0].phone;
	var employeename = req.user[0].fname + ' ' + req.user[0].lname;
	var bid = req.user[0].business;
	var missed = 0;
	var ontime = 0;

	if( isPeter ) { //isPeter
		res.render('business/dashboard-admin', {
			title: 'Express',
			eid: employeeId,
			employeeName: employeename,
			message: req.flash("permission"),
			layout: 'admin',
			dashboard: "active"
		});
	} else if( isOwner ) {
		businesses.findOne(bid, function (err, result) {
			var dbBusiness = result;
			var appointments = db.get('appointments');

			appointments.find({
				business: bid
			}, function (errAppt, resultAppts) {
				var filteredAppts = resultAppts.filter( function (elem, i, arr) {
					return elem.state !== "scheduled";
				});
				var formattedAppts = [];
				filteredAppts.forEach( function (elem, i, arr) {
					if(elem.missed) {
						missed++;
					} else {
						ontime++;
					}
					var apptInfo = {};
					apptInfo.visitor = elem.fname + ' ' + elem.lname;
					apptInfo.apptTime = formatDate(elem.date);

					if(elem.checkedIn) {
						apptInfo.checkedIn = " has checked in.";
					} else {
						apptInfo.checkedIn = " has not checked in.";
					}
					formattedAppts.push(apptInfo);
				});
				res.render('business/dashboard-business', {
					title: 'Express',
					companyName: dbBusiness.companyName,
					eid: employeeId,
					employeeName: employeename,
					email: email,
					logo: dbBusiness.logo,
					phone: phone,
					message: req.flash("permission"),
					isOwner: isOwner,
					businessId: bid,
					dashboard: "active",
					appointments: formattedAppts
				});
		 });
	  });
	} else {

		var db = req.db;
		var appointments = db.get('appointments');
		var employees = db.get('employees');

		var patientList = [];

		appointments.find({
			business: req.user[0].business
		}, function (errAppt, resultAppts) {
			var filteredAppts = resultAppts.filter( function (elem, i, arr) {
				return elem.state !== "scheduled";
			});

			var itemsProcessed = 0;
			console.log(filteredAppts);

			if( filteredAppts.length ) {
				filteredAppts.forEach( function (elem, i, arr) {
					var apptInfo = {};


					apptInfo.visitor = elem.fname + ' ' + elem.lname;
					apptInfo.apptTime = formatDate(elem.date);
					apptInfo.state = elem.state[0].toUpperCase() + elem.state.substr(1);
					apptInfo.currentTime = formatDate(elem.checkin);

					employees.find({
						business: req.user[0].business,
						_id: elem.employee
					}, function (errEmployee, employee) {
						apptInfo.doctor = employee[0].fname;
						patientList.push(apptInfo);
						itemsProcessed++;
						if( itemsProcessed == arr.length ) {
							renderDashboard();
						}
					});
				});
			} else {
				renderDashboard();
			}
		});
	}
};

function renderDashboard () {
	res.render('business/visitor-list', {
		title: "Express",
		isAdmin: req.user[0].admin,
		patients: patientList
	});
}

function formatDate (date) {
	var unformattedApptTime = new Date(date);
	var formattedHour = unformattedApptTime.getHours() > 12 ? unformattedApptTime.getHours() % 12 : unformattedApptTime.getHours();
	var formattedMinutes = unformattedApptTime.getMinutes();
	var ampm = unformattedApptTime.getHours() > 12 ? " PM" : " AM";
	var formattedApptTime = formattedHour + ":" + formattedMinutes + ampm;

	return formattedApptTime;
}
