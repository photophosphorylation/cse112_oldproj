var mongoose = require('mongoose');

mongoose.connect('mongodb://test:test@ds141401.mlab.com:41401/shinypigeons_test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',function(){
    // we're connected
    console.log("we are connected");
});


// TODO: Finish schema
var businessesSchema = mongoose.Schema({
    email: String,
    password: String,
    companyName: String,
    phone: String,
    logo: String,
});

/*
// save the user
businesses.insert({
    email: email,
    password: password,
    companyName: companyName,
    phone: phone,
    fname: fname,
    lname: lname,
    logo: 'http://design.ubuntu.com/wp-content/uploads/ubuntu-logo32.png',
    style: {
        bg: 'http://cdn.wonderfulengineering.com/wp-content/uploads/2014/07/background-wallpapers-26.jpg',
        buttonBg: {
            r: 222,
            g: 224,
            b: 99,
            a: 1,
        },
        buttonText: {
            r: 255,
            g: 255,
            b: 255,
            a: 1,
        },
        containerText: {
            r: 255,
            g: 255,
            b: 255,
            a: 1,
        },
        containerBg: {
            r: 135,
            g: 232,
            b: 215,
            a: 1,
        },
    },
*/
module.exports = mongoose.model('customers', customerSchema);
