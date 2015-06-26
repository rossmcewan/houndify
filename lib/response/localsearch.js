'use strict';

var hotel = exports; exports.constructor = function hotel(){};

var util = require('util');

var TextResponse = require('./text').TextResponse;

var PROPERTIES = {
  'ConversationState.LocalSearchCriteria.MapLocation': 'location',
  'ConversationState.LocalSearchCriteria.ExpensiveFlag': 'expensive',
  'ConversationState.LocalSearchCriteria.StarRatingMin': 'minimumRating',
  'ConversationState.LocalSearchCriteria.CategoriesInclude': 'categories',
  'ConversationState.QueryEntities.Where.0.HighConfidence': 'confidence'
};

function LocalSearchResponse(opts) {
  TextResponse.call(this, {
    raw: opts.raw,
    props: PROPERTIES
  });
}

util.inherits(LocalSearchResponse, TextResponse);

hotel.LocalSearchResponse = LocalSearchResponse;
