(function(require, document, FileReader, navigator) {
	'use strict';

	var $ = require('./js/jquery'),
		login = require('./js/login'),
		upload = require('./js/upload'),
		info = require('./js/infoPage'),
		categories = require('./js/categories'),
		Category = require('./js/category'),
		gui = require('nw.gui');

	$(document).ready(function() {
		Category.configure($, document);
		categories.init();
		login.init(gui, navigator);
		upload.init(document, FileReader, gui, categories);
		info.init(gui, upload);
	});
})(require, document, FileReader, navigator);