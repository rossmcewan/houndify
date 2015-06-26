'use strict';

var validator = exports; exports.constructor = function validator(){};

var _ = require('lodash');
var nodeValidator = require('validator');

nodeValidator.extend('isString', function(str) {
  var isNull = str === 'null';
  var isUndefined = str === 'undefined';
  return _.isString(str) && !isUndefined && !isNull && str.length > 0;
});

validator.get = function() {
  return nodeValidator;
};
