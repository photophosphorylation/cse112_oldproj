/**
 * Handlers for the http request methods for the messenger bot webhook.
 * GET is used to retrieve access tokens
 * POST is used to communicate with the user and kick off appointment
 * creation/cancellation and check in actions
 **/

 var request = require('request');
 var businesses = require('../../model/businesses');
 var businessRoute = require('../webapp/business');
 var state_tracker = require('../../lib/messageTracker');

/* Request made by FB for webhook validation */
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

/* Request made by FB when receiving messages */
exports.post = function(req, res, next) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      console.log("RECEIVED MESSAGE");
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        var senderID = event.sender.id;
        console.log(senderID);
        console.log(typeof senderID);
        console.log(state_tracker);

        if(event.postback) {
          receivedPostBack(event);
        } else if (event.message && state_tracker.statesMapHasKey(senderID)) {
          continueConversation(event);
        } else if(event.message) {
          receivedMessage(event);
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

function continueAddNew(senderID, messageText) {
  var currentState = state_tracker.getCurrentState(senderID);
  var responseText = "";
  var customerName = "";
  var businessName = "";
  var date = "";
  var time = "";

  if(messageText === 'cancel') {
    clearData(senderID);
    responseText = `Ok we can start over or start something else. What
    would you like to do?`;
  } else {

    switch (currentState) {
      case 'S1':

        businessName = messageText;

        if(checkForBusiness(businessName)) {

          state_tracker.addInfo(senderID, businessName);
          state_tracker.changeState(senderID, 'S2');
          responseText =
          `Ok. Let's set up a new appointment with ${businessName}.
What is your first and last name?`;

        } else {

          responseText = `Sorry. I couldn't find a record for ${bname}. Are you
sure you entered the name correctly? Try again or reply with 'cancel' to
start a new process.`

        }
        break;

      case 'S2':

        customerName = messageText;
        businessName = state_tracker.getInfo(senderID, 1);
        state_tracker.addInfo(senderID, customerName);
        state_tracker.changeState(senderID, 'S3');

        if(existingCustomer(businessName, customerName)) {

          responseText =
`Alright, ${customerName}. Looks like you've been to
${businessName} before. That makes my life easier.
What date would you like your appointment?`;

        } else {

          responseText =
          `Looks like your a new ${businessName}
customer, ${customerName}. I'm gonna need a few more pieces of information to
set you up. First, what's your phone number?`;

          state_tracker.changeAction(senderID, 'ADD_NEW_CUSTOMER'); // Branch to the new customer convo
          state_tracker.changeState(senderID, 'N1'); // Customer is in the first state of that action
        }
        break
      case 'S3':
        date = messageText;
        var availableTimes = getAvailableTimes(businessName, date);
        customerName = state_tracker.getInfo(senderID, 2);
        business_name = state_tracker.getInfo(senderID, 1);

        if(availableTimes.length != 0) {
          state_tracker.changeState(senderID, 'S4');
          state_tracker.setAvailableTimes(senderID, availableTimes);
          state_tracker.addInfo(senderID, date);
          responseText = displayAvailableTimes(availableTimes);
        } else {
          responseText = `Sorry, ${customerName}, ${businessName} has no
appointments available on that day. Try a different day.`;
        }
        break;
      case 'S4':
        var times_available =  state_tracker.getAvailableTimes(senderID);
        // Check if user message is a number
        if(!isNaN(messageText)) {
          var choice = Number(messageText);

          if(choice > times_available.length - 1 || choice < 0) {
            responseText = `Sorry that was not a valid choice. Please respond
with a valid choice`;
          } else {
            time = times_available[choice];
            state_tracker.addInfo(senderID, time);
            state_tracker.changeState(senderID, 'S5');
            responseText = getConfirmationText(senderID);
          }
        } else {
          if(messageText === 'another day') {
            responseText = `Ok, what day would you like to see times for?`;
            state_tracker.changeState(senderID, 'S3');
          } else {
            responseText = `That wasn't a valid response. Please respond with a
valid choice.`;
        }
        break;
    case 'S5':
      var confirmationResponse = messageText;
      customerName = state_tracker.getInfo(senderID, 2);

      if(confirmationResponse === 'yes' || confirmationResponse === 'YES' || confirmationResponse === 'Yes') {
        responseText = createNewAppointment(senderID);
        clearData(senderID);
      } else {
        responseText = `REALLY, ${customerName}?!
All that fucking work for nothing?`
      }
    } // END SWITCH
  } // END ELSE
  sendTextMessage(senderID, responseText);
}

/**
 * Checks the business DB for existence of record with name: $business_name$
 */
function checkForBusiness(businessName) {
  console.log("CHECKING IF %S IS AN ACTUAL BUSINESS IN THE DB", businessName);
  //Add logic to find business in db
  return true;
}

/**
 * Checks the customer DB for the existence of a customer w
 */
function existingCustomer(businessName, customerName) {
  // Add logic to determine if the customer is in the db for this business;
  console.log("CHECKING IF %s is an existing customer of %s", customerName, businessName);
  return true;
}

/**
 * Gets the available appointment times for a business on a specified date.
 * Returns an array of times or an empty array if no times are available.
 */
 function getAvailableTimes(businessName, date) {
   console.log("GETTING AVAILABLE TIMES FOR %s on %s", businessName, date);
   return ["10:00AM", "3:30PM", "4:30PM"];
 }

 /**
  * Creates a structured numbered list response the available times.
  * Customer is asked to reply with the number corresponding to the time they
  * desire.
  */
  function displayAvailableTimes(availableTimes) {
    var responseString = "Here are the available times for that day\n";
    var counter = 0;

    availableTimes.forEach(function(time) {
      counter += 1;
      responseString += `${String(counter)}. ${time}\n`;
    })

    responseString += `Respond with the number corresponding to the time you want
to select for your appointment. Or with 'another day' if none of those times work for you.`;

    return responseString;
  }

  /**
   * Creates a response with all the appointment information and asks the
   * Customer to respond yes or no to confirm the info is correct and to proceed
   * to creating and saving the appointment to the DB.
   */
   function getConfirmationText(senderID) {
     console.log("GETTING CONFIRMATION TEXT");
     var confText = [];
     var businessName = state_tracker.getInfo(senderID, 1);
     var customerName = state_tracker.getInfo(senderID, 2);
     var date = state_tracker.getInfo(senderID, 3);
     var time = state_tracker.getInfo(senderID, 4);
     confText.push(`So let's make sure we have all the right information.\n`);
     confText.push(`You want an appointment with ${businessName}\n`);
     confText.push(`On ${date} at ${time}`);
     confText.push(`Is this correct, ${customerName}`);
     console.log("************");
     console.log(confText.join(""));
     return confText.join("");
   }

   /**
    * Creates and saves the customer's appointment in the DB.
    * returns responseText for the customer
    */
    function createNewAppointment(senderID) {
        var customerName = state_tracker.getInfor(senderID, 1);
        return `THAT SHIT WAS CREATED, ${customerName}! Hooray!!!`;
    }

    /**
     * Called when the customer is done with an action or when they want to cancel
     * an action in progress.
     */
    function clearData(senderID) {
      state_tracker.clerData(senderID);
    }


    /**
     * The Check Appointment Time Conversation Branch
     */
    function continueCheckTime(senderID, messageText) {
        sendTextMessage(senderID, "I WOULD CHECK BUT I'M TOO LAZY");
    }

/**
 * Called when the bot is in the middle of an action conversation. Checks the
 * value of action and delegates to the appropriate method accordingly.
 */
function continueConversation(event) {
  var senderID = event.sender.id;
  var action = state_tracker.getAction(senderID);
  var message = event.message;
  console.log("Continuing Conversation. Current state is %s", action);
//  var messageText = `This is a response to continue the convo for ${action}.`;

  switch (action) {
    case 'SET_UP_NEW_APPOINTMENT':
      continueAddNew(senderID, message.text);
      break;
    case 'CHECK_APPOINTMENT_TIME':
      continueCheckTime(message.text);
      break;
    default:
      console.log("DIDNT RECOGNIZE SHIIIIT");
  }

}

/**
 * Called when user sends a new postback from the persistent menu while the
 * system is still working through an appoinment action.
 **/
function handleConflict(payload, senderID) {
  console.log("RECEIVED NEW POSTBACK WHILE IN THE MIDDLE OF AN ACTION");

  var payloadToText = {}
  payloadToText['SET_UP_NEW_APPOINTMENT'] = "setting up a new appointment for you";
  payloadToText['CHECK_APPOINTMENT_TIME'] = "checking your appointment time";
  payloadToText['CHECK_IN_PAYLOAD'] = "checking you in to an appointment";
  payloadToText['CANCEL_APPOINTMENT'] = "cancelling an appointment";

  var currentAction = state_tracker.getAction(senderID);

  var messageText = `I'm in the process of ${payloadToText[currentAction]}.`;

  if(currentAction === payload) {
    messageText += " would you like to start over?";
  } else {
    messageText += ` Should I stop this and start ${payloadToText[payload]}?`;
  }

  state_tracker.handleConflict(senderID);

  return messageText;
}

/**
 * Called when the post request contains a postback. Sets the user's
 * state_tracker action and messageText according to the payload and then
 * delegates to sendTextMessage. If the senderID is not in the map then the user
 * sent a postback before compeleting the steps of another action and
 * handleConlict is called to take care of setting messageText to the
 * appropriate message and preparing state_tracker for the CONFLICT action.
 */
function receivedPostBack(event) {
  console.log("GOT A POSTBACK");

  var senderID = event.sender.id;
  var postback = event.postback;
  var payload = postback.payload;
  var messageText = "";
  var gettingStarted = false;

  console.log(payload);

  if(state_tracker.statesMapHasKey(senderID)) {
    messageText = handleConflict(payload, senderID);
  } else {

    switch (payload) {
        case 'SET_UP_NEW_APPOINTMENT':
          console.log("Customer wants to setup new appointment!");
          messageText = "Ok. Let's set up a new appointment. What is the name of the business you'd like to set up an appointment with?";
          break;
        case 'CHECK_APPOINTMENT_TIME':
          console.log("Customer wants to check their appointment time!!");
          messageText = "Let's check your appointment time. What is the name of the business you have an appointment with?";
          break;
        case 'CHECK_IN_PAYLOAD':
          console.log("Customer wants to check in!");
          messageText = "Ok. I'll check you in to your appointment. What is the name of the business?";
          break;
        case 'CANCEL_APPOINTMENT':
          console.log("Customer wants to cancel their appointment!!");
          messageText = "I'll get started on your appointment cancellation. What is the name of the buisness?";
          break;
        case 'GET_STARTED_PAYLOAD':
          messageText = "Hi there! Welcome to Enque! I can help you with your appointment bullshit. To get started pick an option from the menu in the textbox or reply with 'more options'";
          gettingStarted = true;
          break;
        default:
          console.log("UNRECOGNIZED PAYLOAD");
          messageText = "Sorry I didn't understand your last message.";

    }

    // Do not add to state_tracker if GETTING_STARTED_PAYLOAD was recieved
    if(!gettingStarted) {
      // set the action for this user in state_tracker
      state_tracker.initMapValues(senderID, payload);
    }
  }

  sendTextMessage(senderID, messageText);
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
