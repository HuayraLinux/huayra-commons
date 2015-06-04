module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery');

	return {
		show: function(fileProps) {
			var $ret = $('<div><span class="glyphicon glyphicon-ok"></span><span class="msg"></span></div>');
			$ret.find('.msg').text(fileProps.name);
			return $ret;
		}
	};
})(require);