module.exports = (function(require) {
	'use strict';

	var Promise = require('bluebird'),
		MW = require('nodemw'),
		mw = new MW({
			protocol:  '',
			server: 'commons.wikimedia.org',
			path: 'w',
//			server: "mediawiki-cvcv.rhcloud.com",
//			path: "",
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
					if(err || !res.result || res.result.toLowerCase() != 'success') {
						reject(err);
						return;
					}
					mw.edit('File:' + res.filename, '=={{int:license-header}}==\n' + opts.license, 'Agregando la licencia', function(err, resLicense) {
						if(err || !resLicense.result || resLicense.result.toLowerCase() != 'success') {
							console.warn('license error', err);
							reject(err);
							return;
						}
						fulfill(res);
					})
				});
			});
		}
	};
})(require);