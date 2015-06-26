# Houndify

Node.js client for interacting with the Houndify text processing API

### Usage

```
var Houndify = require('houndify').Houndify;

var client = new Houndify({
  auth: {
    clientId: 'your-client-id',
    clientKey: 'your-client-key',
    userId: 'your-client-userid',
  },
  // Global RequestInfo, sent with every request
  requestInfo: {
    ClientID: 'Some application name'
  }
});

var input = 'What time is it in Tokyo?';
var querySpecificRequestInfo = {
  UserId: '12345'
};

client.query(input, querySpecificRequestInfo, function(err, res) {
...
```
