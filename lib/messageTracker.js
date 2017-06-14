var userStates = new Map();
var gatheredInformation = new Map();
var availableTimes = new Map();

var messageTracker = {

  trackerMap : userStates,
  gatheredInfo : gatheredInformation,
  times : availableTimes,

  initMapValues : function(senderID, action) {
    console.log("Initializing arrays that %s maps to", senderID);
    userStates[senderID] = [action, 'S1'];
    gatheredInformation[senderID] = [action];
    console.log(userStates);
    console.log(gatheredInformation);
  },

  statesMapHasKey : function(senderID) {
    console.log("IN STATESHASKEY");
    console.log(userStates);
    var res = senderID in userStates;
    console.log(res);
    return res;
  },

  getCurrentState : function(senderID) {
    console.log("GETTING CURRENT STATE FOR %s", senderID);
    return userStates[senderID][1];
  },

  addState : function(senderID, state) {
    console.log("IN ADD STATE");
    userStates[senderID].push(state);
  },

  changeState : function(senderID, new_state) {
    userStates[senderID][1] = new_state;
  },

  removeLastState : function(senderID) {
    userStates[senderID].pop();
  },

  clearData  : function(senderID) {
    console.log("DELETING DATA FOR %s", senderID);
    delete userStates[senderID];
    delete gatheredInformation[senderID];
  },

  getStatesArray : function(senderID) {
    return userStates[senderID];
  },

  changeAction : function(senderID, newAction) {
    userStates[senderID][0] = newAction;
  },

  getAction : function(senderID) {
    return userStates[senderID][0];
  },

  handleConflictPrep : function(senderID) {
    userStates[senderID].push(userStates[senderID][0]);
    userStates[senderID].push(userStates[senderID][1]);
    userStates[senderID][0] = 'CONFLICT';
    userStates[senderID][1] = 'S1';
  },

  infoMapHasKey : function(senderID) {
    console.log("IN INFOMAPHASKEY");
    return senderID in gatheredInformation;
  },

  addInfo : function(senderID, info) {
      console.log("ADDING %s to %s's info map", info, senderID);
      gatheredInformation[senderID].push(info);
  },

  getInfo : function(senderID, index) {
    console.log("GETTING INFO");
    return gatheredInformation[senderID][index];
  },

  setAvailableTimes : function(senderID, a_times) {
    availableTimes[senderID] = a_times;
  },

  getAvailableTimes : function(senderID) {
    return availableTimes[senderID];
  },

  clearAvailableTimes : function(senderID) {
    delete availableTimes[senderID];
  }
}

module.exports = messageTracker;
