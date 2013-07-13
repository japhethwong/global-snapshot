
/*
 * GET home page.
 */

var helpers = require('../helpers');

exports.index = function(req, res){
  helpers.getMedia(function(error, media){
    console.log(media);
    res.render('geo.jade', {
        locals: { images: media }
    });
  });
};
