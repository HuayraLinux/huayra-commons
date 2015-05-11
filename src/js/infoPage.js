module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery'),
		router = require('./router');

	return {
		init: function(gui, upload) {
			$('#info-wrapper #back-to-upload').click(function() {
				upload.restart();
				router.goToStep(2);
			});
			$('#info-wrapper .open-external').click(function(e) {
				e.preventDefault();
				gui.Shell.openExternal($(this).attr('href'));
			});
		},
		setData: function(data) {
			$('#info-wrapper #uploaded-file-edition-url')
				.attr('href', data.imageinfo.descriptionurl)
				.text(data.imageinfo.descriptionurl);
			$('#info-wrapper #uploaded-file-view-url')
				.attr('href', data.imageinfo.url)
				.text(data.imageinfo.url);
			$('#info-wrapper #uploaded-description').text(data.imageinfo.parsedcomment);
			$('#info-wrapper #uploaded-file-name').text(data.filename);
		}
	};
})(require);