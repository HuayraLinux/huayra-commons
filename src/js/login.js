module.exports = (function(require) {
	'use strict';

	var mediaWiki = require('./mediaWiki'),
		$ = require('./jquery'),
		router = require('./router');

	return {
		init: function(gui, navigator) {
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
				}, function(err) {
					var errorText;
					err = (err || '') + '';
					if(err.indexOf('WrongPluginPass') != -1) {
						errorText = 'Nombre de usuario o contraseña incorrectos';
					}
					else if(!navigator.onLine) {
						errorText = 'No hay conexión a internet. Comprueba tu conexión y vuelve a intentarlo.';
					}
					else {
						errorText = 'Error: ' + err;
					}
					$(that).find('input').attr('disabled', false);
					$username.focus();
					$password.val('');
					$(that).find('#status')
						.empty()
						.addClass('error')
						.removeClass('info')
						.text(errorText);
				});

				return false;
			});
			return this;
		}
	};
})(require);