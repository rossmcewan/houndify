"use strict";

var houndify = exports; exports.constructor = function houndify(){};

var _ = require('lodash');
var uuid = require('uuid');
var crypto = require('crypto');
var request = require('request');
var base64url = require('base64url');
var validator = require('validator');

var TEXT_ENDPOINT = 'https://api.houndify.com/v1/text';

var REQUEST_INFO = require('./request_info');
var DEFAULT_REQUEST_INFO = {
  ResultUpdateAllowed: false
};

validator.extend('isString', function(str) {
  var isNull = str === 'null';
  var isUndefined = str === 'undefined';
  return _.isString(str) && !isUndefined && !isNull && str.length > 0;
});

String.prototype.capitalizeFirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
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
 * @param {object} requestInfo - Context for the query
 */
Houndify.prototype.query = function(text, requestInfo, cb) {
  if (_.isFunction(requestInfo)) {
    cb = requestInfo;
    requestInfo = null;
  }
  if (!_.isPlainObject(requestInfo)) {
    requestInfo = DEFAULT_REQUEST_INFO;
  }

  // Extend with global requestInfo object
  requestInfo = _.extend({}, this.opts.requestInfo, requestInfo);
  this._request(text, requestInfo, cb);
};

/**
 * Validate provided requestInfo
 *
 * @param {object} requestInfo
 */
Houndify.prototype._validateRequestInfo = function(requestInfo) {
  return _.filter(_.keys(requestInfo), function(key) {
    var method = validator[REQUEST_INFO[key]];
    if (_.isFunction(method)) {
      var result = method(requestInfo[key]);
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
 * @param {object} requestInfo - requestInfo object
 * @param {funciton} cb - Callback function
 */
Houndify.prototype._request = function(query, requestInfo, cb) {
  var results = {};

  // Perform validation
  var validateResult = this._validateRequestInfo(requestInfo);
  if (validateResult.length > 0) {
    var badProperties = validateResult.join(',');
    return cb(new Error('Invalid requestInfo params: ' + badProperties));
  }
  if (_.keys(requestInfo) < 1) {
    return cb(new Error('Invalid requestInfo: at least one param required'));
  }

  var headers = this.headers(requestInfo);
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
      return cb(err);
    }

    // If body present and houndify reports OK
    if (body && body.Status === 'OK') {
      results = _.map(body.AllResults, function(res) {
        return {
          response: res.WrittenResponse,
          data: res.NativeData,
        };
      });

      return cb(null, results, body.AllResults);
    }

    // Otherwise unknown error
    cb(new Error('Unknown error'));
  });
};

/**
 * Construct the appropriate headers for our request
 *
 * @param {object} requestInfo - Complete requestInfo for this request
 */
Houndify.prototype.headers = function(requestInfo) {
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
    'Hound-Request-Info': JSON.stringify(requestInfo),
    'Hound-Client-Authentication': clientAuth.join(';')
  };
};

houndify.Houndify = Houndify;
