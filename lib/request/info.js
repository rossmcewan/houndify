'use strict';

var requestInfo = exports; exports.constructor = function requestInfo(){};

var VALIDATION_MAP = {
  "Latitude": "isInt",
  "Longitude": "isInt",
  "PositionTime": "isInt",
  "PositionHorizontalAccuracy": "isFloat",
  "Street": "isString",
  "City": "isString",
  "State": "isString",
  "Country": "isString",
  "ControllableTrackPlaying": "isBoolean",
  "TimeStamp": "isInt",
  "TimeZone": "isString",
  "ConversationState": "isString",
  "ConversationStateTime": "isInt",
  "Language": "isString",
  "UserID": "isString",
  "RequestID": "isString",
  "SessionID": "isString",
  "ResultUpdateAllowed": "isBoolean",
  "PartialTranscriptsDesired": "isBoolean",
  "MinResults": "isInt",
  "MaxResults": "isInt",
  "ObjectByeCountPrefix": "isBoolean",
  "UseContactData": "isBoolean",
  "UseClientTime": "isBoolean",
  "ForceConversationStateTime": "isBoolean",
  "UnitPreference":"isString"
};

requestInfo.whichValidator = function(key) {
  return VALIDATION_MAP[key];
};
