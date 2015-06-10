module.exports = (function(require) {
	'use strict';

	var mediaWiki = require('./mediaWiki'),
		$ = require('./jquery'),
		router = require('./router');

	return {
		init: function(gui) {
			$('#login-wrapper #register').click(function(e) {
				e.preventDefault();
				gui.Shell.openExternal($(this).attr('href'));
			});
			$('#login-wrapper input[name=username]').focus();
			$('#login-wrapper form').submit(function(e) {
				e.preventDefault();

				var $username = $(this).find('[name=username]'),
					$password = $(this).find('[name=password]'),
					that = this;

				$(this).find('#status')
					.empty()
					.addClass('info')
					.removeClass('error')
					.text('Validando...')
					.append('<span class="glyphicon glyphicon-cog spinner" style="margin-left: 10px;"></span>');

				$(this).find('input').attr('disabled', true);

				mediaWiki.login(
					$username.val().trim(), 
					$password.val()
				).then(function() {
					$(that).find('input').attr('disabled', false);
					router.goToStep(2);
				}, function() {
					$(that).find('input').attr('disabled', false);
					$username.focus();
					$password.val('');
					$(that).find('#status')
						.empty()
						.addClass('error')
						.removeClass('info')
						.text('Nombre de usuario o contraseña incorrectos');
				});

				return false;
			});
			return this;
		}
	};
})(require);