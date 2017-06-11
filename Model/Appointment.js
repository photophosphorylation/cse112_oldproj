var mongoose = require('mongoose');

mongoose.connect('mongodb://test:test@ds141401.mlab.com:41401/shinypigeons_test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){
    // we're connected
    console.log("we are connected");
});

var appointmentSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    timeOf: Date,
    reasonForAppointment: String,
    methodOfCommunication: String,
    ratingReceived: Number,
    Missed: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now }
});

var appointmentModel = mongoose.model('appointments', appointmentSchema);

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
