var userStates = new Map();
var gatheredInformation = new Map();
var availableTimes = new Map();

var messageTracker = {

  trackerMap : userStates,
  gatheredInfo : gatheredInformation,
  times : availableTimes,

  initMapValues : function(trackerID, action) {
    console.log("Initializing arrays that %s maps to", trackerID);
    userStates[trackerID] = [action, 'S1'];
    gatheredInformation[trackerID] = [];
    console.log(userStates);
    console.log(gatheredInformation);
  },

  statesMapHasKey : function(trackerID) {
    console.log("IN STATESHASKEY");
    console.log(userStates);
    var res = trackerID in userStates;
    console.log(res);
    return res;
  },

  getCurrentState : function(trackerID) {
    console.log("GETTING CURRENT STATE FOR %s", trackerID);
    return userStates[trackerID][1];
  },

  changeState : function(trackerID, new_state) {
    userStates[trackerID][1] = new_state;
  },

  clearData  : function(trackerID) {
    console.log("DELETING DATA FOR %s", trackerID);
    delete userStates[trackerID];
    delete gatheredInformation[trackerID];
  },

  changeAction : function(trackerID, newAction) {
    userStates[trackerID][0] = newAction;
  },

  getAction : function(trackerID) {
    return userStates[trackerID][0];
  },

  conflictResolvePrep : function(trackerID) {
    userStates[trackerID].push(userStates[trackerID][0]);
    userStates[trackerID].push(userStates[trackerID][1]);
    userStates[trackerID][0] = 'CONFLICT';
    userStates[trackerID][1] = 'S1';
  },

  infoMapHasKey : function(trackerID) {
    console.log("Checking if infoMap has key %s", trackerID);
    return trackerID in gatheredInformation;
  },

  addInfo : function(trackerID, info) {
      console.log("ADDING %s to %s's info map", info, trackerID);
      gatheredInformation[trackerID].push(info);
  },

  getInfo : function(trackerID, index) {
    console.log("GETTING INFO");
    return gatheredInformation[trackerID][index];
  },

  removeInfo : function(trackerID) {
    console.log("Removing info");
    gatheredInformation[trackerID].pop();
  },

  initAvailableTimesArray : function(trackerID, available_times) {
    availableTimes[trackerID] = available_times;
  },

  getAvailableTimesArray : function(trackerID) {
    return availableTimes[trackerID];
  },

  clearAvailableTimes : function(trackerID) {
    delete availableTimes[trackerID];
  }
}

module.exports = messageTracker;
