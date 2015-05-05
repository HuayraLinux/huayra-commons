(function(require, document, FileReader) {
	'use strict';

	var $ = require('./js/jquery.min'),
		login = require('./js/login'),
		upload = require('./js/upload');

	$(document).ready(function() {
		login.init();
		upload.init(document, FileReader);
	});
})(require, document, FileReader);