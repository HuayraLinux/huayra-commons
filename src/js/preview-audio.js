module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery');

	return {
		show: function(fileProps) {
			var $ret = $('<div><audio controls><source /></audio><div class="props-label"><span class="glyphicon glyphicon-music"></span><span class="msg"></span></div></div>');
			$ret.find('.msg').text(fileProps.name);
			$ret.find('source').attr('src', fileProps.path);
			$ret.find('source').attr('type', fileProps.type);
			return $ret;
		}
	};
})(require);