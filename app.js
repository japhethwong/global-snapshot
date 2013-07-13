
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , map = require('./routes/map')
  , http = require('http')
  , path = require('path');

var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: 'cu5fonPmIHE49ORYjCXUfw',
  consumer_secret: 'ilzoOo60K7UKjkjapkAyQd1c21r9VuGDiSCzhTOdQ',
  access_token_key: '83308529-t3GLeKnGJT2MFi9YPQDutkcli7m4NOszHKmeFgQWs',
  access_token_secret: 'hptgcpkIbpTzqJRUeoEYF89HyKRXYPsfqXvqWogvLg'
});

// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/map', map.show);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port 3000');
});

io.sockets.on('connection', function (socket) {
  socket.on('get_tweets', function (data) {

    twit.stream('statuses/sample', function(stream) {
      stream.on('data', function (data) {
        coordinates = data.coordinates;
        if (coordinates) {
          media = data.entities ? data.entities.media : null;
          media_url = media ? media.map(function(item) { return item.media_url; }) : null;
          socket.emit('tweet', {
            media_url: media_url,
            coordinates: coordinates,
            username: data.user.screen_name,
            time: data.created_at,
            text: data.text
          });
        }
      });
    });

  });
});
