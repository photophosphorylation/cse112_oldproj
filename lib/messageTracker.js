var userStates = new Map();

var messageTracker = {
   trackerMap : userStates,
  hasKey : function(senderID) {
    console.log("IN HASKEY");
    console.log(userStates);
    var res = senderID in userStates;
    console.log(res);
    return res;
  },
  getArray : function(senderID) {
    return userStates[senderID];
  },
  getAction : function(senderID) {
    return userStates[senderID][0];
  },
  handleConflict : function(senderID) {
    userStates[senderID].push(userStates[senderID][0]);
    userStates[senderID].push(userStates[senderID][1]);
    userStates[senderID][0] = 'CONFLICT';
    userStates[senderID][1] = 'S1';
  },
  initStateTracker : function(senderID, action) {
    console.log("IN initStateTracker");
    userStates[senderID] = [action, 'S1'];
    console.log(userStates);
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
  removeKey  : function(senderID) {
    delete userStates[senderID];
  }
}

module.exports = messageTracker;
