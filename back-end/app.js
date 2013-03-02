/**
 *
 */

// Dependencies
var express = require('express'),
    Pusher = require('pusher'),
    config = require('./config.json'),
    events = require('./events.js'),
    pusher = new Pusher(config.pusher);

// Create the express app
var app = express();

// Webhook endpoint
app.post('/paymill', function (req, res) {
  var data = "";

  req.on('data', function (chunk) {
    data += chunk.toString();
  });

  req.on('end', function () {
    data = JSON.parse(data);

    if (!!data && data.hasOwnProperty("event") && !!data.event.hasOwnProperty("event_type")) {
      if (events.hasOwnProperty(data.event.event_type)) {
        events[data.event.event_type](pusher, res, data.event.event_resource);
      }
      else {
        console.log("Unknown event: " + data.event.event_type);
      }
    }

    res.write(JSON.stringify({
      success: true
    }));

    res.end();
  });
});

// Fire away
app.listen(8765);
