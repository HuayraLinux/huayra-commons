module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery'),
		mediaWiki = require('./mediaWiki'),
		router = require('./router'),
		infoPage = require('./infoPage'),
		Promise = require('bluebird'),
		bootbox,
		FileReader,
		fileContent;

	var previewImage = require('./preview-image'),
		previewAudio = require('./preview-audio'),
		previewVideo = require('./preview-video'),
		previewPdf = require('./preview-pdf'),
		previewDefault = require('./preview-default');

	var preview = {
		_selectType: function(mimeType) {
			console.log(mimeType);
			switch(mimeType.split('/')[0]) {
				case 'image':
					this._previewer = previewImage;
					break;
				case 'audio':
					this._previewer = previewAudio;
					break;
				case 'video':
					this._previewer = previewVideo;
					break;
				default:
					if(mimeType == 'application/pdf') {
						this._previewer = previewPdf;
					}
					else {
						this._previewer = previewDefault;
					}
			}
			return this;
		},
		show: function(fileOpts) {
			this._selectType(fileOpts.type);
			$('#upload-wrapper #loaded').empty().append(this._previewer.show(fileOpts));
			return this;
		}
	};

	var loadState = function() {
		$('#upload-wrapper #cancel-reading, #upload-wrapper #cancel-file, #upload-wrapper #loading, #upload-wrapper #loaded, #upload-wrapper #sending-button, #upload-wrapper #cancel-upload').hide();
		$('#upload-wrapper .btn-file, #upload-wrapper #drop-file, #upload-wrapper input[type=submit]').show();
		$('#upload-wrapper #file, #upload-wrapper #title, #upload-wrapper #descripcion').val('');
		$('#upload-wrapper input[type=submit]').attr('disabled', true);
		$('#upload-wrapper #file-button, #upload-wrapper #file, #upload-wrapper #cancel-file, #upload-wrapper #cancel-reading, #upload-wrapper #title, #upload-wrapper #descripcion, #upload-wrapper').attr('disabled', false);
		$('#upload-wrapper #drop-file').removeClass('drag');
		$('#upload-wrapper input[name=license]').prop('checked', false);
	};

	var loadingState = function(fileName, type, path) {
		return function() {
			$('#upload-wrapper #cancel-file, #upload-wrapper .btn-file, #upload-wrapper #drop-file, #upload-wrapper #loaded, #upload-wrapper #sending-button, #upload-wrapper #cancel-upload').hide();
			$('#upload-wrapper #cancel-reading, #upload-wrapper #loading, #upload-wrapper input[type=submit]').show();
			$('#upload-wrapper input[type=submit]').attr('disabled', true);
			$('#upload-wrapper #file-button, #upload-wrapper #file, #upload-wrapper #cancel-file, #upload-wrapper #cancel-reading, #upload-wrapper #title, #upload-wrapper #descripcion, #upload-wrapper').attr('disabled', false);
			$('#upload-wrapper #loading .msg').text('Leyendo ' + fileName + '...');
		};
	};

	var loadedState = function(fileName, type, path) {
		return function(e) {
			$('#upload-wrapper #cancel-reading, #upload-wrapper .btn-file, #upload-wrapper #drop-file, #upload-wrapper #loading, #upload-wrapper #sending-button, #upload-wrapper #cancel-upload').hide();
			$('#upload-wrapper #cancel-file, #upload-wrapper #loaded, #upload-wrapper input[type=submit]').show();
			$('#upload-wrapper #title').val($('#upload-wrapper #title').val() || fileName);
			$('#upload-wrapper input[type=submit]').attr('disabled', false);
			$('#upload-wrapper #file-button, #upload-wrapper #file, #upload-wrapper #cancel-file, #upload-wrapper #cancel-reading, #upload-wrapper #title, #upload-wrapper #descripcion, #upload-wrapper').attr('disabled', false);
			fileContent = e.target.result;
			preview.show({
				name: fileName,
				type: type,
				content: e.target.result,
				path: path
			});
		};
	};

	var sendingState = function() {
		$('#upload-wrapper input[type=submit]').hide();
		$('#upload-wrapper #sending-button, #upload-wrapper #cancel-upload').show();
		$('#upload-wrapper #file-button, #upload-wrapper #file, #upload-wrapper #cancel-file, #upload-wrapper #cancel-reading, #upload-wrapper #title, #upload-wrapper #descripcion, #upload-wrapper').attr('disabled', true);
	};

	var onFileError = function(e) {
		switch(e.target.error.code) {
			case e.target.error.NOT_FOUND_ERR:
				bootbox.alert('Error: no se encontró el archivo');
				break;
			case e.target.error.NOT_READABLE_ERR:
				bootbox.alert('Error: no se puede leer el archivo (revisar sus permisos).');
				break;
			case e.target.error.ABORT_ERR:
				break; // noop
			default:
				bootbox.alert('Error: ocurrió un error leyendo el archivo.');
		}
		loadState();
	};

	var onFileProgress = function(e) {
		if (e.lengthComputable) {
			if(e.total) {
				$('#upload-wrapper #loading .completed').text(Math.round((e.loaded / e.total) * 100) + '%');
			}
		}
		if(!e.lengthComputable || !e.total) {
			$('#upload-wrapper #loading .completed').text('');
		}
	};

	var readFile = function(files) {
		if(files.length > 1) {
			bootbox.alert('Por favor, selecciona sólo un archivo');
			loadState();
			return;
		}

		if(files.length) {
			var reader = new FileReader();

			$('#upload-wrapper #cancel-reading').off().click(function(e) {
				e.preventDefault();
				reader.abort();
			});

			reader.onerror = onFileError;
			reader.onprogress = onFileProgress;
			reader.onabort = loadState;
			reader.onloadstart = loadingState(files[0].name, files[0].type, files[0].path);
			reader.onload = loadedState(files[0].name, files[0].type, files[0].path);
			reader.readAsBinaryString(files[0]);
		}
	};

	var showCaptcha = function(captcha) {
		return new Promise(function(fulfill, reject) {
			$('#captcha-wrapper').modal('show');

			$('#captcha-wrapper form').off().submit(function(e) {
				e.preventDefault();
				$('#captcha-wrapper').modal('hide');
				captcha.next($('#captcha-wrapper #captcha-response').val(), fulfill, reject);
			});

			if(captcha.type == 'image') {
				$('#captcha-wrapper #graphic-captcha').show();
				$('#captcha-wrapper #text-captcha').hide();
				$('#captcha-wrapper #graphic-captcha img').attr('src', captcha.image);
			}
			else {
				$('#captcha-wrapper #graphic-captcha').hide();
				$('#captcha-wrapper #text-captcha').show();
				$('#captcha-wrapper #text-captcha #captcha-question').text(captcha.question);
			}
		});
	};

	var uploadOk = function(res) {
		if(res.captcha) {
			showCaptcha(res.captcha).then(uploadOk, uploadError);
			return;
		}
		infoPage.setData(res);
		router.goToStep(3);
	};

	var uploadError = function(err) {
		debugger;
		bootbox.alert('Ocurrió un error' + (err ? ': ' + err : '.'));
		loadState();
	};

	return {
		init: function(document, FR, gui) {
			bootbox = require('./bootbox')(document);

			$('#captcha-wrapper').modal({
				backdrop: 'static',
				keyboard: false,
				show: false
			});

			$('#upload-wrapper .license-wrapper a').click(function(e) {
				e.preventDefault();
				gui.Shell.openExternal($(this).attr('href'));
			});

			$('#upload-wrapper form').submit(function(e) {
				e.preventDefault();

				if(!fileContent) {
					bootbox.alert('Error: debes seleccionar un archivo.');
					return
				}

				sendingState();

				mediaWiki.upload({
					fileName: $('#upload-wrapper #title').val(),
					file: fileContent,
					summary: $('#upload-wrapper #descripcion').val(),
					license: $('#upload-wrapper input[name=license]').val()
				}).then(uploadOk, uploadError);
			})

			FileReader = FR;
			document.body.addEventListener('drop', function(e) {
				e.preventDefault();
			}, false);
			var dropElement = document.getElementById('drop-file');

			$('#upload-wrapper #cancel-file').click(function(e) {
				e.preventDefault();
				loadState();
			});

			$('#upload-wrapper #file').change(function(e) {
				readFile($(this).get(0).files);
			});

			dropElement.addEventListener('dragover', function(e) {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
				$(dropElement).addClass('drag');
			}, false);
			dropElement.addEventListener('dragenter', function(e) {
				$(dropElement).addClass('drag');
			}, false);
			dropElement.addEventListener('dragleave', function(e) {
				$(dropElement).removeClass('drag');
			}, false);
			dropElement.addEventListener('drop', function(e) {
				e.preventDefault();
				e.stopPropagation();
				readFile(e.dataTransfer.files);
			}, false);
		},
		restart: loadState
	};
})(require);