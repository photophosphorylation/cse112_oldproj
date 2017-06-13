/**
 * Http request methods for the messenger bot webhook.
 * GET is used to retrieve access tokens
 * POST is used to communicate with the user and kick off appointment
 * creation/cancellation and check in actions
 **/

 var request = require('request');
 var businesses = require('../../model/businesses');
 var businessRoute = require('../webapp/business');
 var mTracker = require('../../messageTracker');

exports.get = function (req, res) {
  console.log("IN THE WEBHOOK");

  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === "ey_foo_verify_me_plsss") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
};

exports.post = function(req, res, next) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      console.log("Recieved Message Via POST Request");
      mTracker.userMessages['1'] = mTracker.userMessages['1'] || [];
      mTracker.userMessages['1'].push("aWORD");
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        console.log(mTracker.userMessages['1']);
        if(req.session.items != null) {
          receivedMessageHandler(event, req);
        }
        if (event.message) {
          receivedMessage(event);
        } else if(event.postback) {
          receivedPostBack(event, req);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
};

function receivedPostBack(event, req) {
  console.log("IT'S A POSTBACK!!");

  var postback = event.postback;
  var payload = postback.payload;

  console.log(payload);

  if(payload === 'SET_UP_NEW_APPOINTMENT') {

    console.log("Customer wants to setup new appointment!");
    handleAppointmentSetup(event, req);

  } else if(payload === 'CHECK_APPOINTMENT_TIME') {

    console.log("Customer wants to check their appointment time!!");
    handleCheckAppointment(event);

  } else if(payload === 'CHECK_IN_PAYLOAD') {

    console.log("Customer wants to check in!");
    handleCheckIn(event);

  } else if(payload === 'CANCEL_APPOINTMENT') {

    console.log("Customer wants to cancel their appointment!!");
    handleCancelAppointment(event);

  } else if(payload === 'GET_STARTED_PAYLOAD') {

    console.log("Customer hit getting started");
    handleGettingStarted(event);

  } else {
    console.log("Unrecognized PAYLOAD!!!");
  }
}

function handleGettingStarted(event) {
  console.log("here we will display the basic convo options to the customer");

  var senderID = event.sender.id;
  var messageText = "Hi there! Welcome to Enque! I can help you with your appointments. To get started pick an option from the menu in the textbox or reply with 'more help'(case sensitive)";

  sendTextMessage(senderID, messageText);
}

function handleAppointmentSetup(event, req) {
  console.log("here we will as the customer for some information and attempt to set up a new appointment");

  req.session.items = ['NEW'];

  var senderID = event.sender.id;
  var messageText = "Ok, let's set up an appointment. Tell me the name of the bussiness you want to set up an appointment with.";
  sendTextMessageWithSession(senderID, messageText,req);
}

function handleCheckIn(event) {
  console.log("here we will check the customer in");

  var senderID = event.sender.id;
  var messageText = "Ok, let's check you in to your appointment. Tell me the name of the Business you have an appointment with.";

  sendTextMessage(senderID, messageText);
}

function handleCheckAppointment(event) {
  console.log("here we will tell the customer their appintment time");

  var senderID = event.sender.id;
  var messageText = "Ok, let's check your appointment time. Tell me the name of the Business followed by your name in the following format: 'Time: {BUSINESS NAME}, {YOUR FIRST NAME AND LAST NAME}'";

  sendTextMessage(senderID, messageText);
}

function handleCancelAppointment(event) {
  console.log("here we will help a customer cancel an appointment");

  var senderID = event.sender.id;
  var messageText = "Ok, let's cancel your appointment. Tell me the name of the Business followed by your name in the following format: 'Cancel: {BUSINESS NAME}, {YOUR FIRST NAME AND LAST NAME}'";

  sendTextMessage(senderID, messageText);
}

function setUpNewFirst(event, bname, req) {
    var senderID = event.sender.id;
    var messageText = "Ok. What is your first and last name?"
    businesses.findOne({companyName: bname})
    .exec(function(err, business) {
      if(business == null) {
        messageText = "Sorry. I couldn't find a record for that business. Can you make sure you typed their name correctly, please."
      } else {
        req.session.items.push(bname);
      }
    });

    sendTextMessage(senderID, messageText);
}

function receivedMessageHandler(event, req) {
  if(req.session.items != null && req.session.items[0] === 'NEW') {

      if(req.session.items.length == 1) {
        var businessName = event.message.message.text;
        setUpNewFirst(event, businessName, req);
      }


  }
}

/**
 * Called when a message is posted to the webhook.
 * Checks the content of the message and sends the appropriate response.
 */
function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
      senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

      // If we receive a text message, check to see if it matches a keyword
      // and send back the example. Otherwise, just echo the text we received.
      switch (messageText) {
        case 'generic':
          sendGenericMessage(senderID);
          break;

        default:
          sendTextMessage(senderID, messageText);
      }
    } else if (messageAttachments) {
      sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendGenericMessage(recipientId, messageText) {
  console.log("SEND GENERIC");
  var messageData = {
   recipient: {
     id: recipientId
   },
   message: {
     attachment: {
       type: "template",
       payload: {
         template_type: "generic",
         elements: [{
           title: "rift",
           subtitle: "Next-generation virtual reality",
           item_url: "https://www.oculus.com/en-us/rift/",
           image_url: "http://messengerdemo.parseapp.com/img/rift.png",
           buttons: [{
             type: "web_url",
             url: "https://www.oculus.com/en-us/rift/",
             title: "Open Web URL"
           }, {
             type: "postback",
             title: "Call Postback",
             payload: "Payload for first bubble",
           }],
         }, {
           title: "touch",
           subtitle: "Your Hands, Now in VR",
           item_url: "https://www.oculus.com/en-us/touch/",
           image_url: "http://messengerdemo.parseapp.com/img/touch.png",
           buttons: [{
             type: "web_url",
             url: "https://www.oculus.com/en-us/touch/",
             title: "Open Web URL"
           }, {
             type: "postback",
             title: "Call Postback",
             payload: "Payload for second bubble",
           }]
         }]
       }
     }
   }
 };

 callSendAPI(messageData);
  // To be expanded in later sections
}

function sendTextMessageWithSession(recipientId, messageText, req) {
  console.log(req.session.items);

  var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText
      }
  };

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.9/me/messages',
    qs: { access_token: 'EAAGJUkyyk4oBAJCmVDSDEEZB9LXBgdceMgzrBvZC8PEzPMGbiFhZARdCK8XiwtcsCpvSXovKsKjcR7JDUdxWTaQ6GZCPaZAvrfyj5ydbdd0ukb49uwiw1XBTNUGVYGQPcmTGpOv00wZB0r3ShZAYmuEcojDBCSjyxSXQlXIz60mngZDZD'},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
/*
exports.post = function (req, res) {
  };
 */
