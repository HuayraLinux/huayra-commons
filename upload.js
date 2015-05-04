/**
 * Example script for file uploads
 *
 * @see http://www.mediawiki.org/wiki/API:Upload
 */
'use strict';

var fs = require('fs');

var bot = require('nodemw');
var client = new bot({
      server: "mediawiki-cvcv.rhcloud.com",
	    path: "",
	    debug: true,
      port: 80,
	    username: "test",
	    password: "asd123",
	    userAgent: "foo/bar.net",
	    concurrency: 5
});

client.logIn(function(err) {

  var fileName = "logo123.png";
  var content = fs.readFileSync('src/imagenes/logo.png');
  var summary = "123";

	client.upload(fileName, content, summary, function(err, res) {
    //console.log(err, res);
    console.log(res);
    console.log("LA URL A MOSTRAR ES " + res.imageinfo.url);
    console.log("LA URL ES " + res.imageinfo.descriptionurl);
  });
});
