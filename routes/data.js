var request = require("request");
var url = require("url");

request.post(
	'https://api.instagram.com/v1/subscriptions/',
	{
		'client_id': '9727dbbcbcdc47f6b70964201ec51b72',
		'client_secret': 'd3b5d25125624e0eb17af3f90bd40940',
		'object': 'user',
		'aspect': 'media',
		'verify_token': 'myVerifyToken',
		'callback_url': 'http://photobomb.herokuapp.com/map',
	},
	function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
