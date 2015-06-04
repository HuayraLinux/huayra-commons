module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery');

	return {
		show: function(fileProps) {
			var $ret = $('<div class="preview-image-wrapper"><img src="" class="preview-image" /></div>');
			$ret.find('.preview-image').attr('src', fileProps.path);
			return $ret;
		}
	};
})(require);