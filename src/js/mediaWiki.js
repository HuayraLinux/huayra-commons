module.exports = (function(require) {
	'use strict';

	var Promise = require('bluebird'),
		MW = require('nodemw'),
		mw = new MW({
			protocol:  '',
			server: 'mediawiki-cvcv.rhcloud.com',
			path: '',
			debug: true,
			port: 80,
			userAgent: 'foo/bar.net',
			concurrency: 5
		});

//	username: 'test',
//	password: 'asd123',
	return {
		login: function(username, password) {
			return new Promise(function(fulfill, reject) {
				mw.logIn(username, password, function(err) {
					if(err) {
						reject(err);
					}
					else {
						fulfill();
					}
				});
			});
		},
		upload: function(opts) {
			return new Promise(function(fulfill, reject) {
				mw.upload(opts.fileName, opts.file, opts.summary, function(err, res) {
					if(err) {
						reject(err);
						return;
					}
					fulfill(res);
				});
			});
		}
	};
})(require);