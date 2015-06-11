(function(require, document, FileReader, navigator) {
	'use strict';

	var $ = require('./js/jquery'),
		login = require('./js/login'),
		upload = require('./js/upload'),
		info = require('./js/infoPage'),
		gui = require('nw.gui');

	$(document).ready(function() {
		login.init(gui, navigator);
		upload.init(document, FileReader, gui);
		info.init(gui, upload);
	});
})(require, document, FileReader, navigator);