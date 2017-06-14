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
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'customers'},
    aptTime: { type: Date, default: Date.now },
    missed: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('appointments', appointmentSchema);
