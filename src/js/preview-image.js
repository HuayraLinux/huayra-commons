module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery');

	return {
		show: function(fileProps) {
			var $ret = $('<div class="preview-image-wrapper"><img src="" class="preview-image" /></div>');
			$ret.find('.preview-image').attr('src', fileProps.path);
			return $ret;
		},
		info: function(data) {
			$ret = $('<div class="info-image-wrapper"><div class="thumb-code">[[File:' + data.imageinfo.url + '|thumb|alt=Alt|Caption]]</div><div class="img-wrapper"><img /></div></div>');
			$ret.find('.img-wrapper img').attr('src', data.imageinfo.url);
			return $ret;
		}
	};
})(require);