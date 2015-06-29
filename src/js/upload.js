module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery'),
		mediaWiki = require('./mediaWiki'),
		categories = require('./categories'),
		Category = require('./category'),
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

		Category.reset();
		$('#upload-wrapper #categories').empty();
		$('#upload-wrapper #new-category, #upload-wrapper #add-category').attr('disabled', false);
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
			$('#upload-wrapper #title').val($('#upload-wrapper #title').val() || fileName.replace(/\#<>\[\]\|\:\{\}\//g, '_'));
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

		$('#upload-wrapper #new-category, #upload-wrapper #add-category').attr('disabled', true);
		Category.disable();
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
		bootbox.alert('<p><strong>Ocurrió un error y no se ha podido subir el archivo.</strong></p>' + (err ? '<p>Detalles del error: <i>' + err : '</i>.</p>'));
		loadState();
	};

	return {
		init: function(document, FR, gui) {
			bootbox = require('./bootbox')(document);

			categories.ready(function() {
				$('#loading-categories').hide();
				$('#no-categories').show();
				$('#new-category, #add-category').attr('disabled', false);
				var categoriesList = document.createDocumentFragment();
				categories.getAll().forEach(function(aCategory) {
					if(aCategory.length < 3) {
						return;
					}
					$(document.createElement('option'))
						.attr('label', aCategory)
						.val(aCategory)
						.appendTo(categoriesList);
				});
				$('#categories-list').append(categoriesList);
			});

			$('#new-category').keydown(function(e) {
				if(e.keyCode == 13) {
					$('#add-category').click();
				}
			});

			$('#add-category').click(function() {
				try {
					new Category($('#new-category').val(), $('#categories'));
					$('#new-category').val('');
					$('#new-category').focus();
					$('#no-categories').hide();
				}
				catch(e) {
					bootbox.alert(e);
				}
			});

			Category.onRemove(function() {
				if(!Category.getAll().length) {
					$('#no-categories').show();
				}
			});

			////////////////////////////////

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
				var _send = function() {
					sendingState();

					mediaWiki.upload({
						fileName: $('#upload-wrapper #title').val().trim(),
						file: fileContent,
						summary: $('#upload-wrapper #descripcion').val(),
						categories: Category.getUploadCategories(),
						license: $('#upload-wrapper input[name=license]').val()
					}).then(uploadOk, uploadError);
				};

				var _descripcion = function() {
					return new Promise(function(fulfill, reject) {
						if(!$('#upload-wrapper #descripcion').val().trim()) {
							bootbox.dialog({
								message: 'Aún no escribiste una descripción para este archivo. Te recomendamos enfáticamente hacerlo. ¿Estás seguro/a de querer subir el archivo sin escribir antes su descripción?',
								title: '¿Subir archivo sin descripción?',
								buttons: {
									cancel: {
										label: 'Cancelar',
									},
									success: {
										label: "OK",
										className: "btn-success",
										callback: fulfill
									}
								}
							});
						}
						else {
							fulfill();
						}
					});
				};

				var _categorias = function() {
					return new Promise(function(fulfill, reject) {
						if(!Category.getAll().length) {
							bootbox.dialog({
								message: 'No categorizaste el archivo. Te recomendamos enfáticamente hacerlo. ¿Estás seguro/a de querer subir el archivo sin categorizarlo antes?',
								title: '¿Subir archivo sin categorizar?',
								buttons: {
									cancel: {
										label: 'Cancelar',
									},
									success: {
										label: "OK",
										className: "btn-success",
										callback: fulfill
									}
								}
							});
						}
						else {
							fulfill();
						}
					});
				};

				e.preventDefault();

				if(!fileContent) {
					bootbox.alert('Error: debes seleccionar un archivo.');
					return;
				}

				if(!$('#upload-wrapper #title').val().trim()) {
					bootbox.alert('Debes escribir un nombre para el archivo');
					return;
				}

				if($('#upload-wrapper #title').val().match(/\#<>\[\]\|\:\{\}\//)) {
					bootbox.alert('El título no puede contener los caracteres: "# < > [ ] | : { } /"');
					return;
				}

				_descripcion().then(_categorias).then(_send);
			});

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