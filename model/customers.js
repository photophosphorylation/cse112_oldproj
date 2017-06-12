var mongoose = require('mongoose');

mongoose.connect('mongodb://test:test@ds141401.mlab.com:41401/shinypigeons_test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){
    // we're connected
    console.log("we are connected");
});

var customerSchema = mongoose.Schema({
    //business: {type: mongoose.Schema.Types.ObjectId, ref: 'businesses'},
    firstName: String,
    lastName: String,
    age: String,
    address: String,
    phone: String,
    email: String,
    createdOn: { type: Date, default: Date.now }
});

var customerModel = mongoose.model('customers', customerSchema);
module.exports = customerModel;
