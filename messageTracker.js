var userMessageTable = {}

var messageTracker = {
  userMessages: userMessageTable,
  addValueToKey : function(userID, message) {
          userMessages[userID] = userMessages[userID] || [];
          userMessages[userID].push(message);
  },
  removeKey  : function(userID) {
    userMessages.delete(userID);
  }
}

module.exports = messageTracker;
