/**
 * Sends sms messages using twilio
 * @param {int} number = a valid 10 digit phone number
 * @param {string} message = the message that you want to send
 */
exports.sendMessage = function(number, message)
{
var twilio = require('twilio');
var client = new twilio('AC3be60ae479740df44b0c8258912db239', 'da00829fb274f1d0c8a9b5ee555289b7');

client.messages.create({
    body: message,
    to: number,  // Text this number
    from: '9514325711' // From a valid Twilio number
})
.then((message) => console.log(message.sid));
}
