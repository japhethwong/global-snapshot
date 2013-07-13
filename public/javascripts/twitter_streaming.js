var util = require('util'),
    http = require('http'),
    events = require('events');

var Twitter = function(opts) {
    this.username = opts.username;
    this.password = opts.password;
    this.track = opts.track;
    this.data = '';
};

Twitter.prototype = new events.EventEmitter;

Twitter.prototype.getTweets = function() {
    var opts = {
            host: 'stream.twitter.com',
            port: 80,
            path: '/1/statuses/filter.json?track=' + this.track,
            method: 'POST',
            headers: {
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'User-Agent': 'Example Twitter Streaming Client',
                'Authorization': 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64'),
            },
        },
        self = this;

    this.connection = http.request(opts, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            self.data += chunk.toString('utf8');

            var index, json;

            while((index = self.data.indexOf('\r\n')) > -1) {
                json = self.data.slice(0, index);
                self.data = self.data.slice(index + 2);
                if(json.length > 0) {
                    try {
                        self.emit('tweet', JSON.parse(json));
                    } catch(e) {
                        self.emit('error', e);
                    }
                }
            }
        });
    });

    this.connection.write('?track=' + this.track);
    this.connection.end();
};

module.exports = Twitter;