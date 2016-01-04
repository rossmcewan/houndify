"use strict";

var houndify = exports; exports.constructor = function houndify(){};

var _ = require('lodash');
var uuid = require('uuid');
var crypto = require('crypto');
var request = require('request');
var base64url = require('base64url');

var response = require('./response');
var validator = require('./validator');
var requestInfo = require('./request/info');

var TEXT_ENDPOINT = 'https://api.houndify.com/v1/text';

var DEFAULT_REQUEST_INFO = {
  ResultUpdateAllowed: false
};

function Houndify(opts) {
  this.opts = _.isPlainObject(opts)? opts : {};

  if (!_.isPlainObject(this.opts.auth)) {
    throw new Error('auth required');
  }
  if (!this.opts.auth.clientId) {
    throw new Error('auth.clientId required');
  }
  if (!this.opts.auth.clientKey) {
    throw new Error('auth.clientKey required');
  }
  if (!this.opts.auth.userId) {
    throw new Error('auth.userId required');
  }
}

/**
 * Query the houndify text API
 *
 * @param {string} text - Query text
 * @param {object} requestInfoObj - Context for the query
 */
Houndify.prototype.query = function(text, requestInfoObj, cb) {
  if (_.isFunction(requestInfoObj)) {
    cb = requestInfoObj;
    requestInfoObj = null;
  }
  if (!_.isPlainObject(requestInfoObj)) {
    requestInfoObj = DEFAULT_REQUEST_INFO;
  }

  // Extend with global requestInfoObj object
  requestInfoObj = _.extend({}, this.opts.requestInfoObj, requestInfoObj);
  this._request(text, requestInfoObj, cb);
};

/**
 * Validate provided requestInfo
 *
 * @param {object} requestInfoObj
 */
Houndify.prototype._validateRequestInfo = function(requestInfoObj) {
  var validate = validator.get();
  return _.filter(_.keys(requestInfoObj), function(key) {
    var methodName = requestInfo.whichValidator(key);
    if (_.isFunction(validate[methodName])) {
      var result = validate[methodName](requestInfoObj[key]);
      return !result;
    } else {
      return true;
    }
  });
};

/**
 * Perform the request
 *
 * @param {string} query - Query text
 * @param {object} requestInfoObj - requestInfo object
 * @param {funciton} cb - Callback function
 */
Houndify.prototype._request = function(query, requestInfoObj, cb) {
  var results = {};

  // Perform validation
  var validateResult = this._validateRequestInfo(requestInfoObj);
  if (validateResult.length > 0) {
    var badProperties = validateResult.join(',');
    return cb(new Error('Invalid requestInfo params: ' + badProperties));
  }
  if (_.keys(requestInfoObj) < 1) {
    return cb(new Error('Invalid requestInfo: at least one param required'));
  }

  var headers = this.headers(requestInfoObj);
  var opts = {
    method: 'POST',
    url: TEXT_ENDPOINT,
    headers: headers,
    qs: {
      query: query
    },
  };

  request(opts, function(err, res) {
    if (err) {
      return cb(err);
    }
    if (res.statusCode === 502) {
      return cb(new Error('Bad gateway'));
    }
    if (res.statusCode === 503) {
      return cb(new Error('Service unavailable'));
    }
    if (res.statusCode === 404) {
      return cb(new Error('Not found'));
    }
    if (res.statusCode === 400) {
      return cb(new Error('Bad request'));
    }

    var body;
    try {
      body = JSON.parse(res.body);
    } catch(err) {
      console.log('Error parsing body: ', err);
      return cb(err);
    }
    console.log('Body: ', body);
    // If body present and houndify reports OK
    if (body && body.Status === 'OK') {
      results = _.map(body.AllResults, response.identifyAndExtend);
      return cb(null, results, body.AllResults);
    }

    // Otherwise unknown error
    cb(new Error('Unknown error'));
  });
};

/**
 * Construct the appropriate headers for our request
 *
 * @param {object} requestInfoObj - Complete requestInfo for this request
 */
Houndify.prototype.headers = function(requestInfoObj) {
  var requestId = uuid.v4();
  var timestamp = Math.floor(Date.now() / 1000);

  var userId = this.opts.auth.userId;
  var clientKey = this.opts.auth.clientKey;
  var clientId = this.opts.auth.clientId;

  var value = userId + ';' + requestId + timestamp;
  var clientKeyBuffer = new Buffer(clientKey, 'base64');
  var hmac = crypto.createHmac('sha256', clientKeyBuffer).update(value);
  var digest = hmac.digest('buffer').toString('base64');
  var signature = base64url.fromBase64(digest) + '=';

  var requestAuth = [
    userId,
    requestId,
  ];

  var clientAuth = [
    clientId,
    timestamp,
    signature
  ];

  return {
    'Hound-Request-Authentication': requestAuth.join(';'),
    'Hound-Request-Info': JSON.stringify(requestInfoObj),
    'Hound-Client-Authentication': clientAuth.join(';')
  };
};

houndify.Houndify = Houndify;
