var mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://test:test@ds141401.mlab.com:41401/shinypigeons_test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){
    // we're connected
    console.log("we are connected");
});

var appointmentSchema = mongoose.Schema({
    business: {type: mongoose.Schema.Types.ObjectId, ref: 'businesses'},
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'customers'},
    customerFirstName: String,
    customerLastName: String,
    customerAge: String,
    phone: String,
    email: String,
    aptTime: { type: Date, default: Date.now },
    missed: { type: Boolean, default: false },
    checkedIn: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('appointments', appointmentSchema);
