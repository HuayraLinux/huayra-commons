module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery');

	return {
		show: function(fileProps) {
			var $ret = $('<div class="preview-image-wrapper"><video controls><source /></video></div>');
			$ret.find('.msg').text(fileProps.name);
			$ret.find('source').attr('src', fileProps.path);
			$ret.find('source').attr('type', fileProps.type);
			return $ret;
		},
		info: function(data) {
			var $ret = $('<div class="info-video-wrapper"><div class="thumb-code">[File:Neg]</div><div class="video-wrapper"><video controls><source /></video></div></div>');
			$ret.find('.msg').text(fileProps.name);
			$ret.find('source').attr('src', fileProps.path);
			$ret.find('source').attr('type', fileProps.type);
			return $ret;
		}
	};
})(require);