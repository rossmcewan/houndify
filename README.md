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
  requestInfo: {
    UserID: '12345'
  }
});

client.query('What time is it in Tokyo?', function(err, res) {
...
```
