'use strict';

var hotel = exports; exports.constructor = function hotel(){};

var util = require('util');

var TextResponse = require('./text').TextResponse;

var PROPERTIES = {
  'ConversationState.HotelFilterSpec.MapLocation': 'location',
  'ConversationState.HotelFilterSpec.MapLocation.HighConfidence': 'confidence',
};

function HotelResponse(opts) {
  TextResponse.call(this, {
    raw: opts.raw,
    props: PROPERTIES
  });
}

util.inherits(HotelResponse, TextResponse);

hotel.HotelResponse = HotelResponse;
