var mongoose = require('mongoose');

mongoose.connect('mongodb://test:test@ds141401.mlab.com:41401/shinypigeons_test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){
    // we're connected
    console.log("we are connected");
});

var appointmentSchema = mongoose.Schema({
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'customer'},
    aptTime: { type: Date, default: Date.now },
    missed: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('appointments', appointmentSchema);
/*
module.exports = function(req,res) {
    var doc = new appointmentModel({
        timeOf: Date.now(),
        reasonForAppointment: "Business",
        methodOfCommunication: "SMS",
        ratingReceived: 5,
        firstName: "Beter",
        lastName: "Griffin"
    });
    doc.save(function (err) {
        if (err) {
            console.log(err)
            return
    }
    else {
        // Saved
        console.log('it is saved')
    }
    })
}
*/
>>>>>>> 2a6509da6609ec5f1c763271b59bf3764008a861:model/appointments.js
