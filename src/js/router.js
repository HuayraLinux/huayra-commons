module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery');

	return {
		goToStep: function(stepNumber) {
			$('body')
				.removeClass('paso-1 paso-2 paso-3')
				.addClass('paso-' + stepNumber);
			return this;
		}
	};
})(require);