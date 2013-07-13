
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , map = require('./routes/map')
  , http = require('http')
  , path = require('path')
  , request = require('request')
  , url = require('url')
  , Instagram = require('instagram-node-lib');

var $ = require('jquery').create();

var app = express();
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server);

var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: 'cu5fonPmIHE49ORYjCXUfw',
  consumer_secret: 'ilzoOo60K7UKjkjapkAyQd1c21r9VuGDiSCzhTOdQ',
  access_token_key: '83308529-t3GLeKnGJT2MFi9YPQDutkcli7m4NOszHKmeFgQWs',
  access_token_secret: 'hptgcpkIbpTzqJRUeoEYF89HyKRXYPsfqXvqWogvLg'
});

Instagram.set('client_id', '9727dbbcbcdc47f6b70964201ec51b72');	
Instagram.set('client_secret', 'd3b5d25125624e0eb17af3f90bd40940');
Instagram.set('callback_url', 'http://photobomb.herokuapp.com/auth');

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

app.get('/auth', function(req, resp) {
  	console.log("\n== Calling /auth ==");
  	
  	if (req.param("hub.challenge") != null)	 {
  		console.log("hub.challenge not null");
  		console.log("req.param['hub.challenge']: " + req.param("hub.challenge"));
  		console.log("resp.url: " + resp.url);
  		resp.send(req.param("hub.challenge"));
  	} else {
  		console.log("ERROR did not find hub.challenge in request: %s", util.inspect(request));
  	}


  	/*resp.post(
     	'https://api.instagram.com/v1/subscriptions/',
     	{
     		form: {
     			'client_id': '9727dbbcbcdc47f6b70964201ec51b72',
     			'client_secret': 'd3b5d25125624e0eb17af3f90bd40940',
     			'object': 'user',
     			'aspect': 'media',
     			'verify_token': 'myVerifyToken',
     			'callback_url': 'http://photobomb.herokuapp.com/map',
     		}
     	}, function (req, resp) {
     		console.log("req:\n" + req);
     		console.log("\nresp: \n" + resp);
     		console.log("\nresp.url: " + resp.url);

     		var params = url.parse(resp.url, true).pathname;
     		console.log("params: " + params);
     		console.log('hub.mode: ' + params['hub.mode']);
     		response.send(params['hub.challenge'] || 'No hub.challenge present');
     	}
    );*/
  	/*Instagram.subscriptions.handshake(req, resp, function(data) {
  		console.log("handshake() log");
  		console.log(data);
  	});*/

});



app.get('/subscribe', function(req, resp){
  	console.log("\n== Calling /subscribe ==");
  	Instagram.media.subscribe({ lat: 48.858844300000001, lng: 2.2943506, radius: 1000 });

    /*request.post(
     	'https://api.instagram.com/v1/subscriptions/',
     	{
     		form: {
     			'client_id': '9727dbbcbcdc47f6b70964201ec51b72',
     			'client_secret': 'd3b5d25125624e0eb17af3f90bd40940',
     			'object': 'user',
     			'aspect': 'media',
     			'verify_token': 'myVerifyToken',
     			'callback_url': 'http://photobomb.herokuapp.com/map',
     		}
     	}, function (req, resp) {
     		console.log("req:\n" + req);
     		console.log("\nresp: \n" + resp);
     		console.log("\nresp.url: " + resp.url);

     		var params = url.parse(resp.url, true).pathname;
     		console.log("params: " + params);
     		console.log('hub.mode: ' + params['hub.mode']);
        response.send(params['hub.challenge'] || 'No hub.challenge present');
     	}
    );*/

});


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

io.sockets.on('connection', function (socket) {
  socket.on('get_flickr', function(data) {
    console.log('get_flickr');
    $.getJSON('http://anyorigin.com/get?url=http%3A//api.flickr.com/services/feeds/photos_public.gne%3Fformat%3Djson&callback=?', function(data){
      function jsonFlickrFeed(o) {
        items = o.items;
        for (var item in items) {
          item = items[item];
          link = item.link;
          id = link.split('/').slice(-2)[0];
          url = item.media.m;

          socket.emit('flickr', {
            id: id,
            url: url
          });
        }
      }
      eval(data.contents);
    });
  });
});
