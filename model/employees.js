var mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://test:test@ds141401.mlab.com:41401/shinypigeons_test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){
    // we're connected
    console.log("we are connected");
});

var exmployeeSchema = mongoose.Schema({
    business: {type: mongoose.Schema.Types.ObjectId, ref: 'businesses'},
    aptTime: { type: Date, default: Date.now }
    missed: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now }
});
/*
employees.insert({
    business: ObjectId(businessID),
    password: result.password,
    phone: result.phone,
    fname: result.fname,
    lname: result.lname,
    email: result.email,
    smsNotify: true,
    emailNotify: true,
    admin: true
},function(err, user){
*/
module.exports = mongoose.model('employees', employeeSchema);
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
