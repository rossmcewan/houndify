'use strict';

var dateandtime = exports; exports.constructor = function dateandtime(){};

var util = require('util');

var TextResponse = require('./text').TextResponse;

var PROPERTIES = {
  'ConversationState.DestinationMapLocation': 'location',
  'ConversationState.DestinationTime.Date': 'date',
  'ConversationState.DestinationTime.Time': 'time',
  'ConversationState.DestinationMapLocation.HighConfidence': 'confidence',
};

function DateAndTimeResponse(opts) {
  TextResponse.call(this, {
    raw: opts.raw,
    props: PROPERTIES
  });
}

util.inherits(DateAndTimeResponse, TextResponse);

dateandtime.DateAndTimeResponse = DateAndTimeResponse;
