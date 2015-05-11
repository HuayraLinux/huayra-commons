(function(require, document, FileReader) {
	'use strict';

	var $ = require('./js/jquery'),
		login = require('./js/login'),
		upload = require('./js/upload'),
		info = require('./js/infoPage'),
		gui = require('nw.gui');

	$(document).ready(function() {
		login.init();
		upload.init(document, FileReader);
		info.init(gui, upload);
	});
})(require, document, FileReader);