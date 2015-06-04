module.exports = (function(require) {
	'use strict';

	var Promise = require('bluebird'),
		server = 'commons.wikimedia.org',
//		server = "mediawiki-cvcv.rhcloud.com",
		MW = require('nodemw'),
		mw = new MW({
			protocol:  '',
			server: server,
			path: 'w',
//			path: "",
			debug: true,
			port: 80,
			userAgent: 'foo/bar.net',
			concurrency: 5
		});

//	username: 'test',
//	password: 'asd123',


	var setLicense = function(fileName, license, captchaData, res) {
		console.log(fileName, license, captchaData, res);
		return new Promise(function(fulfill, reject) {
			mw.edit('File:' + fileName, '=={{int:license-header}}==\n' + license, 'Agregando la licencia', function(err, resLicense) {
				if(err) {
					console.warn('license error', err);
					reject(err);
					return;
				}

				if(resLicense.captcha) {
					fulfill({
						next: function(userResponse, fulfill, reject) {
							setLicense(fileName, license, {
								id: resLicense.captcha.id,
								word: userResponse
							}, res).then(fulfill, reject);
						},
						type: resLicense.captcha.type,
						image: resLicense.captcha.type == 'image' ? server + resLicense.captcha.url : null,
						question: resLicense.captcha.type != 'image' ? resLicense.captcha.question : null
					});
				}
				else {
					fulfill(res);
				}
			}, captchaData);
		});
	};

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
					setLicense(res.filename, opts.license, null, res).then(fulfill, reject);
				});
			});
		}
	};
})(require);