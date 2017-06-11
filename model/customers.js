var mongoose = require('mongoose');

mongoose.connect('mongodb://test:test@ds141401.mlab.com:41401/shinypigeons_test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){
    // we're connected
    console.log("we are connected");
});

var customerSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    address: String,
    phone: String,
    email: String,
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('customers', customerSchema);
