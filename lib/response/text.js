'use strict';

var text = exports; exports.constructor = function text(){};

var _ = require('lodash');

var PROPERTIES = {
  'WrittenResponse': 'text',
  'WrittenResponseLong': 'textLong',
};

function TextResponse(opts) {
  if (!_.isPlainObject(opts)) {
    throw new Error('opts required');
  }
  if (!opts.raw) {
    throw new Error('opts.raw required');
  }

  this.raw = opts.raw;
  this.views = {};

  this._extendProperties(_.extend({}, opts.props, PROPERTIES));
  this._identifyViews();
}

/**
 * Houndify will suggest views to be used
 */
TextResponse.prototype._identifyViews = function() {
  var self = this;
  var views = _.without(this.raw.ViewType, 'Native');
  _.each(views, function(viewType) {
    self.views[viewType] = self.raw[viewType + 'Data'];
  });
};

/**
 * Access known properties of the raw object and expose them
 */
TextResponse.prototype._extendProperties = function(props) {
  var self = this;
  _.each(props, function(friendlyKey, responseKey) {
    self[friendlyKey] = valueByDotNotation(responseKey, self.raw);
  });
  
  function valueByDotNotation(dotNotation, obj) {
    dotNotation = dotNotation.split(".");
    for (var i = 0; i < dotNotation.length; i++) {
      obj = obj && obj[dotNotation[i]];
    }
    return obj;
  }
};

text.TextResponse = TextResponse;
