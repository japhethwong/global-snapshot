
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

var app = express();
Instagram.set('client_id', '9727dbbcbcdc47f6b70964201ec51b72');	
Instagram.set('client_secret', 'd3b5d25125624e0eb17af3f90bd40940');
Instagram.set('callback_url', 'http://photobomb.herokuapp.com/auth');

// all environments
app.set('port', process.env.PORT || 3000);
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
  	Instagram.subscriptions.handshake(req, resp); 
});



app.get('/subscribe', function(req, resp){
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
  console.log('Express server listening on port ' + app.get('port'));
});
