/**
 * Handlers for the http request methods for the messenger bot webhook.
 * GET is used to retrieve access tokens
 * POST is used to communicate with the user and kick off appointment
 * creation/cancellation and check in actions
 **/

var request = require('request');
var businesses = require('../../model/businesses');
var appointments = require('../../model/appointments');
var customers = require('../../model/customers');
var businessRoute = require('../webapp/business');
var tracker = require('../../lib/messageTracker');


/**********************************************************************************************************
                Multi-Use Message Strings
----------------------------------------------------------------------------------------------------------*/
const invalidResponse = "Sorry that was not a valid response. Please respond with a valid choice.";
const processFinished = "Reply with another option if you want help with something else or with 'bye' if "
  + " you would like to end our conversation";
const invalidPhoneNumber = "That wasn't a valid phone number. Respond with a valid phone number, please.";

/*--------------------------------------------------------------------------------------------------------
*********************************************************************************************************/

/* Handles request made by FB for webhook validation */
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


/* Handles messages sent to the webhook */
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
        console.log(tracker);

        /**
         * Postbacks are sent when the customer selected one of the items from
         * the persistent menu.
         **/
        if(event.postback) {
          receivedPostBack(event);
        } else if (event.message) {
          if(event.message.text === 'cancel') {
              clearData(senderID);
              responseText = "Ok we can start over or start something else. Pick a new option from the menu";
              sendTextMessage(senderID, responseText);
          } else if(tracker.statesMapHasKey(senderID)) {
              continueConversation(event);
        } else {
          receivedMessage(event);
        }
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

/*******************************************************************************************************************************
--------------------------------------------------------------------------------------------------------------------------------
    'Set Up New Appointment' Conversation Methods

    For the "set up new appointment" action the tracker.gatheredInfo array will have the following elements in this EXACT order:

          [ BUSINESS_NAME, BUSINESS_ID, BUSINESS_PHONE#, CUSTOMER_NAME, CUSTOMER_ID, APPT_DATE, APPT_TIME ]

--------------------------------------------------------------------------------------------------------------------------------
*******************************************************************************************************************************/

/**
 * Main handler for the Set Up Appoinment Conversation. Checks the message state and
 * the message content and delegates to message generating functions accordingly.
 * Finally passes the created message to sendTextMessage().
 * @param trackerID The customer's FB messenger id. Used as a key in various maps contained in tracker.
 */
function continueSetUpNew(trackerID, messageText) {
  var currentState = tracker.getCurrentState(trackerID);
  var responseText = "";
  var customerName = "";
  var businessName = "";
  var date = "";
  var time = "";
  var bid = "";
  var cid = "";

    switch (currentState) {
      case 'S1':

        businessName = messageText;

        if(findBusiness(trackerID, businessName)) {

          tracker.changeState(trackerID, 'S2');
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


        businessName = tracker.getInfo(trackerID, 0);
        bid = tracker.getInfo(trackerID, 1);
        tracker.addInfo(trackerID, customerName);
        tracker.changeState(trackerID, 'S3');

        if(existingCustomer(trackerID, bid, customerName)) {

          responseText = `Alright, ${customerName}. Looks like you've been to ${businessName} before.`
            + "That makes my life easier. What date would you like your appointment?";

        } else {

          responseText = `Looks like your a new ${businessName} customer, ${customerName}.`
            + " I'm gonna need a few more pieces of information to set you up. First, what's your phone number?";

          tracker.changeAction(trackerID, 'ADD_NEW_CUSTOMER'); // Branch to the new customer convo
          tracker.changeState(trackerID, 'S1'); // Customer is now in the first state of that convo branch
        }
        break;
      case 'S3':

        if(tracker.getInfo(trackerID, 5)) {
          tracker.removeInfo(trackerID);
        }

        date = messageText;
        customerName = tracker.getInfo(trackerID, 3);
        businessName = tracker.getInfo(trackerID, 0);
        bid = tracker.getInfo(trackerID, 1);

        var availableTimes = getAvailableTimes(bid, date);

        if(availableTimes.length != 0) {
          tracker.changeState(trackerID, 'S4');
          tracker.initAvailableTimesArray(trackerID, availableTimes);
          tracker.addInfo(trackerID, date);
          responseText = displayAvailableTimes(date, availableTimes);
        } else {
          responseText = `Sorry, ${customerName}, ${businessName} has no appointments available on that day.`
            + " Try a different date.";
        }
        break;
      case 'S4':
        var times_available =  tracker.getAvailableTimesArray(trackerID);

        // Check if user response is a number
        if(!isNaN(messageText)) {
          var choice = Number(messageText);

          if(choice > times_available.length  || choice < 0) {

            responseText = invalidResponse;

          } else {
            time = times_available[choice];
            tracker.addInfo(trackerID, time);
            tracker.changeState(trackerID, 'S5');
            responseText = buildConfirmationText(trackerID);
          }
        } else {

          if(messageText === 'another day') {

            responseText = `Ok, what day would you like to see times for?`;
            tracker.changeState(trackerID, 'S3');

          } else {
            responseText = invalidResponse;
        }
      }
        break;
    case 'S5':
      var confirmationResponse = messageText;

      if(confirmationResponse === 'yes') {
        responseText = createNewAppointment(trackerID);

      } else if(confirmationResponse === 'no'){
        responseText = "Ok. Tell me whether you would like to change the time or date.\n"
        + " Or reply with 'bye' to end this conversation.";
        tracker.changeState(trackerID, 'S6');
      } else {
        reponseText = "Didn't understand your response. Reply with 'yes' or 'no', please."
      }
      break;
    case 'S6':
      var fieldToChange = messageText;

      if(fieldToChange === 'time') {

        date = tracker.getInfo(trackerID, 5)
        tracker.removeInfo(trackerID);
        tracker.changeState(trackerID, 'S4');
        responseText = displayAvailableTimes(date, tracker.getAvailableTimesArray(trackerID));
      } else if(fieldToChange === 'date'){
        tracker.removeInfo(trackerID);
        tracker.removeInfo(trackerID);
        tracker.changeState(trackerID, 'S3');
        responseText = "What date would you like your appointment";
      } else {
        responseText = "You can only change the time and date. Reply with either of those fields or with 'bye' to end this conversation";
      }


    } // END SWITCH

  sendTextMessage(trackerID, responseText);
}

/**
 * Looks in the business DB for a record that matches businessName.
 * If a matching record is found the business's name, id, and phone number are added
 * to the customer's tracker.gatheredInfo array.
 * @param trackerID The customer's messenger id and tracker key.
 * @param businessName the name of the business we want a record for.
 * @return The id of the business if the record is found. Empty string otherwise.
 **/
function findBusiness(trackerID, businessName) {
  console.log("Checking if %S is an actual business in the db", businessName);
  tracker.addInfo(trackerID, businessName);
  tracker.addInfo(trackerID, '21231231241425345ds'); // The bid
  tracker.addInfo(trackerID, '3334445555'); // The phone number
  //Add logic to find business in db
  return "12321313";
}

/**
 * Checks the customer DB for a record that matches the bid and customerName.
 * If the customer record is found their customer id is added to their tracker.gatheredInfo array
 * @param bid The businessID to match the customer document on
 * @param customerName The name of the customer who's record we are searching
 * for
 * @return true if a matching customer record is found.
 **/
function existingCustomer(trackerID, bid, customerName) {
  // Add logic to determine if the customer is in the db for this business;
  console.log("CHECKING IF %s is an existing customer of %s", customerName);

  tracker.addInfo(trackerID, "23423412523423");// add the customer's db record id if found
  return true;
}

/**
* Gets the available appointment times for a business on a specified date.
* @param bid The id of the business who's available times we want
* @return an array of the avaialable times if there are any. An empty array if none are
* avaialble.
**/
function getAvailableTimes(businessName, date) {
  console.log("GETTING AVAILABLE TIMES FOR %s on %s", businessName, date);

  //Get avaialable times and put them into an array

  return ["10:00AM", "3:30PM", "4:30PM"];
}

/**
* Creates a structured numbered list response with the available times.
* Customer is asked to reply with the number corresponding to the time they
* desire.
* @param availableTimes Array of appointment times
* @return a numbered list string of the avaialable times.
**/
function displayAvailableTimes(date, availableTimes) {
  var responseString = `Here are the available times on ${date}\n`;
  var counter = 0;

  availableTimes.forEach(function(time) {
    counter += 1;
    responseString += `${String(counter)}. ${time}\n`;
  })

  responseString += "Respond with the number corresponding to the time you want"
    + " to select for your appointment. Or with 'another day' if none of those times work for you.";

  return responseString;
}

/**
* Creates a response with all the appointment information and asks the
* Customer to respond yes or no to confirm the info is correct and to proceed
* to creating and saving the appointment to the DB.
* @param trackerID The fb messenger id of the customer the bot is conversing with
* @return a confirmation message
**/
function buildConfirmationText(trackerID) {
  console.log("GETTING CONFIRMATION TEXT");
  var confText = [];
  var businessName = tracker.getInfo(trackerID, 0);
  var customerName = tracker.getInfo(trackerID, 3);
  var date = tracker.getInfo(trackerID, 5);
  var time = tracker.getInfo(trackerID, 6);
  confText.push(`So let's make sure we have all the right information.\n`);
  confText.push(`You want an appointment with ${businessName} `);
  confText.push(`On ${date} at ${time}\n`);
  confText.push(`Is this correct, ${customerName}?`);
  console.log("************");
  console.log(confText.join(""));
  return confText.join("");
}

/**
* Creates and saves the customer's appointment in the DB.
* returns responseText for the customer
* @param trackerID the customer's fb messenger id
**/
function createNewAppointment(trackerID) {
  var customerName = tracker.getInfo(trackerID, 1);
  var botResponseText = `Your appointment was created, ${customerName}!\n`;
  botResponseText += "If you are done just say 'bye'. Otherwise pick another option from the "
    + "menu or reply with another option";

  clearData(trackerID);
  return botResponseText;
}

/**
 * Called when the customer is done with an action or when they cancel
 * an action in progress.
 * @param trackerID The customer's unique identifier.
 **/
function clearData(trackerID) {

  tracker.clearData(trackerID);
}

/***************************************************************************************************************
    Check Appointment Time Conversation methods

    For the "check appointment time" action the tracker.gatheredInfo array will have the following elements in this EXACT order:

          [ BUSINESS_NAME, BUSINESS_ID, BUSINESS_PHONE#, CUSTOMER_FIRST_NAME, APPT_DATE, APPT_TIME, APPT_ID ]

/*-------------------------------------------------------------------------------------------------------------
****************************************************************************************************************/

/**
 * Main handler for the 'Check Appointment Time' conversation.
 * @param trackerID The customer's messenger id and unique tracker key. Used to keep track of the conversation.
 * @param messageText The content of the message sent by the customer
 **/
function continueCheckTime(trackerID, messageText) {
  var currentState = tracker.getCurrentState(trackerID);
  var responseText = "";
  var businessName = "";
  var phoneNumber = "";

    switch (currentState) {
      case 'S1':

        businessName = messageText;

        if(findBusiness(trackerID, businessName)) {

          tracker.changeState(trackerID, 'S2');
          responseText = `Alright. I'll check when your next appointment with ${businessName} is.`
            + " Just need one more piece of information from you before I can do that. What is your phone number?";

        } else {

          responseText = `Sorry. I couldn't find a record for ${bname}.`
            + "Are you sure you entered the name correctly? Try again or"
            + " reply with 'cancel' to start a new process.";

        }
        break;

      case 'S2':
        if(messageText.match(/\d{9}/)){ //Check if 9 digit number
          var business_phone = tracker.getInfo(trackerID, 2);
          phoneNumber = messageText;
          businessName = tracker.getInfo(trackerID, 0);
          bid = tracker.getInfo(trackerID, 1);
          apptID = findAppointment(bid, phoneNumber, trackerID);

          if(apptID.length != 0) {

              responseText = getAppointmentInformation(trackerID);
              clearData(trackerID);
          } else {

          responseText =
          `I couln't find an appointment for ${businessName} that matches that phone number.
 Try another phone number or call ${businessName} at ${business_phone}. Respond
 with a new phone number or 'bye' to end this conversation.`;

          }
        } else {
          responseText = invalidPhoneNumber;
        }
    } // END SWITCH

  sendTextMessage(trackerID, responseText);
}

/**
 * Checks the appointment db for a record matching the business id and a phone number.
 * If an appointment is found the appointment date, appointment ime, customer's first name,
 * and the appointment id is stored in the customer's tracker.gatheredInfo array
 * @param bid The business id we are trying to match
 * @param phoneNumber The customer phone number we are also trying to match
 * @param trackerID The customer's identifier. Used to retrieve and store information in the tracker maps
 * @return If a matching record is found the appointment id is returned. Otherwise returns the empty string.
 **/
function findAppointment(bid, phoneNumber, trackerID) {
  //Check DB and populate fields accordingly

  var date = "10/10/2017";
  var time = "10:00AM";
  var firstName = "Lou";
  var apptID = "123456780123231324234";

  tracker.addInfo(trackerID, firstName);
  tracker.addInfo(trackerID, date);
  tracker.addInfo(trackerID, time);
  tracker.addInfo(trackerID, apptID);

  return true;
}

/**
 * Builds the text string with the customer's appointment information.
 * @param trackerID The customer's identifier. Used to retrieve information from the tracker maps
 * @return A string containing the customer's appointment information
 **/
function getAppointmentInformation(trackerID) {
    var businessName = tracker.getInfo(trackerID, 0);
    var name = tracker.getInfo(trackerID, 3);
    var date = tracker.getInfo(trackerID, 4);
    var time = tracker.getInfo(trackerID, 5);

    var appointmentInfo = [];

    appointmentInfo.push(`Alright, ${name}. Here is the date and time for your appointment with ${businessName}.\n`);
    appointmentInfo.push(`${date}\n`);
    appointmentInfo.push(`${time}\n`);
    appointmentInfo.push(processFinished);

    return appointmentInfo.join("");
}


/***************************************************************************************************************
    Appointment Check-In Conversation methods

    For the appointment check-in action the tracker.gatheredInfo array will have these elements in this EXACT order:

          [ BUSINESS_NAME, BUSINESS_ID, BUSINESS_PHONE#, CUSTOMER_FIRST_NAME, APPT_TIME, APPT_ID ]

/*-------------------------------------------------------------------------------------------------------------
****************************************************************************************************************/


/**
 * Handles the Check-In conversation branch.
 * @param trackerID
 * @param messageText
 **/
function continueCheckIn(trackerID, messageText) {
  var currentState = tracker.getCurrentState(trackerID);
  var responseText = "";
  var customerName = "";
  var businessName = "";
  var date = "";
  var time = "";
  var bid = "";
  var cid = "";
  var phoneNumber = "";

    switch (currentState) {
      case 'S1':

        businessName = messageText;

        if(findBusiness(trackerID, businessName)) {

          tracker.changeState(trackerID, 'S2');
          responseText =
          `Your appointment is with ${businessName}, got it. What is your phone number?`;
        } else {

          responseText = `Sorry. I couldn't find a record for ${bname}. Are you
sure you entered the name correctly? Try again or reply with 'cancel' to
start a new process.`

        }
        break;

      case 'S2':
        if(messageText.match(/\d{9}/)){ //Check if 9 digit number

          phoneNumber = messageText;
          businessName = tracker.getInfo(trackerID, 0);
          bid = tracker.getInfo(trackerID, 1);

          if(findAppointmentForCheckIn(bid, phoneNumber, trackerID)) {

              responseText = checkInCustomer(trackerID);

          } else {

          responseText =
          `I couln't find an appointment for ${businessName} that matches that phone number.
Try another phone number or call ${businessName} at ${business_phone}. Respond
with a new phone number or 'bye' to end this conversation.`;

          }
        } else {
          responseText = invalidPhoneNumber;
        }
    } // END SWITCH

  sendTextMessage(trackerID, responseText);
}

/**
 * Finds the customer's appoinment and adds the customer's first name and the appointment time
 * to the customer's gatheredinfo array.
 * @param bid The business id to match the appointment constarin the search for the appointment
 * @param phoneNumber The phone number that the retrieved document should match
 * @param trackerID The customer's unique identifier which is used by the conversation tracker
 * @return true only if the appointment was found.
 **/
function findAppointmentForCheckIn(bid, phoneNumber, trackerID) {
    console.log("Searching for an appointment for customer check in");

    // Populate vars according to result
    var firstName = "Steve";
    var apptTime = "11:00AM";
    var apptID = "43254234234";


    tracker.addInfo(trackerID, firstName); //Customer's first name
    tracker.addInfo(trackerID, apptTime);
    tracker.addInfo(trackerID, apptID);
    return true;
}

/**
 * Checks in the customer to their appointment. Also clears the customer data.
 * @param trackerID The customer's unique identifier in the the conversation trackerID
 * @param apptID
 * @return A string containing the message letting the customer know they are checked in and
 * telling them how to reply to end the conversation or to start a new process.
 **/
function checkInCustomer(trackerID, apptID) {

  var apptID = tracker.getInfo(trackerID, 5);
  //set the appt checked-in flag to true and save
  var businessName = tracker.getInfo(trackerID, 0);
  var firstName = tracker.getInfo(trackerID, 3);
  var apptTime = tracker.getInfo(trackerID, 4);

  var botResponseText = []

  botResponseText.push(`You are all checked-in for your appointment with ${businessName}, ${firstName}. `);
  botResponseText.push(processFinished);

  clearData(trackerID);

  return botResponseText.join('');
}

/***************************************************************************************************************
    Cancel Appointment Conversation methods

    For the cancel appointment action the tracker.gatheredInfo array will have these elements in this EXACT order:

          [ BUSINESS_NAME, BUSINESS_ID, BUSINESS_PHONE#, CUSTOMER_FIRST_NAME, APPT_DATE, APPT_TIME, APPT_ID ]

/*-------------------------------------------------------------------------------------------------------------
****************************************************************************************************************/

/**
 * Main handler for the Cancel Appointment conversation
 * @param trackerID
 * @param messageText
 **/
 function continueCancelAppointment(trackerID, messageText) {
   var currentState = tracker.getCurrentState(trackerID);
   var responseText = "";
   var businessName = "";
   var phoneNumber = "";

     switch (currentState) {
       case 'S1':

         businessName = messageText;

         if(findBusiness(trackerID, businessName)) {

           tracker.changeState(trackerID, 'S2');
           responseText = `Ok. Cancelling an appointment with ${businessName}.`
             + " What is your phone number?";

         } else {

           responseText = `Sorry. I couldn't find a record for ${bname}.`
             + "Are you sure you entered the name correctly? Try again or"
             + " reply with 'cancel' to start a new process.";

         }
         break;

       case 'S2':

         if(messageText.match(/\d{9}/)){ //Check if 9 digit number
           var business_phone = tracker.getInfo(trackerID, 2);
           phoneNumber = messageText;
           businessName = tracker.getInfo(trackerID, 0);
           bid = tracker.getInfo(trackerID, 1);

           if(findAppointment(bid, phoneNumber, trackerID)) {

               responseText = confirmCancellation(trackerID);
               tracker.changeState(trackerID, 'S3');

           } else {

           responseText =
           `I couln't find an appointment for ${businessName} that matches that phone number.
  Try another phone number or call ${businessName} at ${business_phone}. Respond
  with a new phone number or 'bye' to end this conversation.`;

           }
         } else {
           responseText = invalidPhoneNumber;
         }
         break;

      case 'S3':
        if(messageText === 'yes') {
          responseText = cancelAppointment(trackerID);
        } else if(messageText === 'no'){
          responseText = "Ok. I won't cancel your appointment then. " + processFinished;
          clearData(trackerID);
        }
     } // END SWITCH

   sendTextMessage(trackerID, responseText);
 }

/**
 *
 **/
function confirmCancellation(trackerID) {
    var businessName = tracker.getInfo(trackerID, 0);
    var firstName = tracker.getInfo(trackerID, 3);
    var date = tracker.getInfo(trackerID, 4);
    var time = tracker.getInfo(trackerID, 5);

    var botResponseText = []

    botResponseText.push(`So your appointment with ${businessName} `);
    botResponseText.push(`is on ${date} at ${time}.`);
    botResponseText.push(` Are you sure you want to cancel this appointment, ${firstName}?`);

    return botResponseText.join("");
}

/**
 *
 **/
function cancelAppointment(trackerID) {
  var apptID = tracker.getInfo(trackerID, 6);
  var firstName = tracker.getInfo(trackerID, 3);
  var businessName = tracker.getInfo(trackerID, 0);

  // find and delete the appointment matcing the appointment id

  var botResponseText = `Alright, ${firstName}. Your appointment with ${businessName} has been cancelled. `
    + processFinished;

  clearData(trackerID);
  return botResponseText;
}

/**
 * Called when the bot is in the middle of an action conversation. Checks the
 * value of action and delegates to the appropriate method accordingly.
 **/
function continueConversation(event) {
  var trackerID = event.sender.id;
  var action = tracker.getAction(trackerID);
  var message = event.message;
  console.log("Continuing Conversation. Current state is %s", action);

  switch (action) {
    case 'SET_UP_NEW_APPOINTMENT':
      continueSetUpNew(trackerID, message.text);
      break;
    case 'CHECK_APPOINTMENT_TIME':
      continueCheckTime(trackerID, message.text);
      break;
    case 'CHECK_IN_PAYLOAD':
      continueCheckIn(trackerID, message.text);
      break;
    case 'CANCEL_APPOINTMENT':
      continueCancelAppointment(trackerID, message.text);
      break;
    case 'CONFLICT':
      resolveConflict(trackerID, message.text);
      break;
    default:
      console.log("DIDN'T RECOGNIZE ACTION");
  }

}

/**
 * Called when user sends a new postback from the persistent menu while the
 * bot is still working through an action conversation.
 **/
function handleConflict(payload, trackerID) {
  console.log("RECEIVED NEW POSTBACK WHILE IN THE MIDDLE OF AN ACTION");

  var payloadToText = {}
  payloadToText['SET_UP_NEW_APPOINTMENT'] = "setting up a new appointment for you";
  payloadToText['CHECK_APPOINTMENT_TIME'] = "checking your appointment time";
  payloadToText['CHECK_IN_PAYLOAD'] = "checking you in to an appointment";
  payloadToText['CANCEL_APPOINTMENT'] = "cancelling an appointment";

  var currentAction = tracker.getAction(trackerID);

  var messageText = `I'm in the process of ${payloadToText[currentAction]}.`;
  tracker.conflictResolvePrep(trackerID);

  if(currentAction === payload) {
    messageText += " would you like to start over?";
  } else {
    messageText += ` Should I stop this and start ${payloadToText[payload]}?`;
  }

  return messageText;
}

function resolveConflict(trackerID, messageText) {
    // Add logic to resolve conflict for now will just start over
    clearData(trackerID);
    botResponseText = "Ok. We'll start over. Please select an option from the menu in the text box."
    sendTextMessage(trackerID, botResponseText);
}

/**
 * Called when the post request contains a postback. Sets the user's
 * tracker action and messageText according to the payload and then
 * delegates to sendTextMessage. If the trackerID is not in the map then the user
 * sent a postback before compeleting the steps of another action and
 * handleConlict is called to take care of setting messageText to the
 * appropriate message and preparing tracker for the CONFLICT action.
 */
function receivedPostBack(event) {
  console.log("GOT A POSTBACK");

  var trackerID = event.sender.id;
  var postback = event.postback;
  var payload = postback.payload;
  var messageText = "";
  var gettingStarted = false;

  console.log(payload);

  if(tracker.statesMapHasKey(trackerID)) {
    messageText = handleConflict(payload, trackerID);
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
          messageText = "Hi there! Welcome to Enque! I can help you with your appointments. To get started pick an option from the menu in the textbox or reply with 'more options'";
          gettingStarted = true;
          break;
        default:
          console.log("UNRECOGNIZED PAYLOAD");
          messageText = "Sorry I didn't understand your last message.";

    }

    // Do not add to tracker if GETTING_STARTED_PAYLOAD was recieved
    if(!gettingStarted) {

      // set the action for this user in tracker
      tracker.initMapValues(trackerID, payload);
    }
  }

  sendTextMessage(trackerID, messageText);
}

/**
 * Sends a message with the bot's main conversation options by passing the
 * message and the recipientID to callSendAPI
 * @param recipientID The messenger id of the user who will receive the message
 **/
function sendMoreOptions(recipientID) {
    messageText = ""; // This will be a const declared at the top of the file
    callSendAPI(recipientID, messageText);
}

/**
 * Called when a message is posted to the webhook.
 * Checks the content of the message and sends the appropriate response.
 * @param event Json object body of the post request received.
 */
function receivedMessage(event) {
    var trackerID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
      trackerID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

      // If we receive a text message, check to see if it matches a keyword
      // and send back the example. Otherwise, just echo the text we received.
      switch (messageText) {
        case 'more options':
          sendMoreOptions(trackerID);
          break;
        case 'setup new appointment':
          // send to function that inits the state and info array
          // and generates the appropriate message
          break;
        case 'check appointment time':
          // send to function that inits the state and info array
          // and generates the appropriate response
          break;
        case 'cancel appointment':
          // send to cancel appointment handler
          break;
        case 'generic':
          sendGenericMessage(trackerID);
          break;
        default:
          sendTextMessage(trackerID, messageText);
      }
    } else if (messageAttachments) {
      sendTextMessage(trackerID, "Message with attachment received");
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
}

/**
 * Prepares a json object with the recipientID and message text
 * then passes the object to callSendAPI to make the POST request
 * that actually sends the message.
 * @param recipientID The messenger id of the recipient
 * @param messageText The message that will be sent
 **/
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

/**
 * Makes a post request to the SendAPI to send a message to a user.
 * @param messageData The json body json object of the POST request.
 **/
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
