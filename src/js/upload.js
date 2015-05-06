module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery'),
		bootbox = require('./bootbox'),
		FileReader;

	var loadState = function() {
		$('#upload-wrapper #cancel-reading, #upload-wrapper #cancel-file, #upload-wrapper #loading, #upload-wrapper #loaded').hide();
		$('#upload-wrapper .btn-file, #upload-wrapper #drop-file').show();
		$('#upload-wrapper #file').val('');
		$('#upload-wrapper #drop-file').removeClass('drag');
	};

	var loadingState = function(fileName) {
		return function() {
			$('#upload-wrapper #cancel-file, #upload-wrapper .btn-file, #upload-wrapper #drop-file, #upload-wrapper #loaded').hide();
			$('#upload-wrapper #cancel-reading, #upload-wrapper #loading').show();
			$('#upload-wrapper #loading .msg').text('Leyendo ' + fileName + '...');
		};
	};

	var loadedState = function(fileName) {
		return function(e) {
			$('#upload-wrapper #cancel-reading, #upload-wrapper .btn-file, #upload-wrapper #drop-file, #upload-wrapper #loading').hide();
			$('#upload-wrapper #cancel-file, #upload-wrapper #loaded').show();
			$('#upload-wrapper #title').val($('#upload-wrapper #title').val() || fileName);
			$('#upload-wrapper #loaded .msg').text(fileName);
			// e.target.result
		};
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
			reader.onloadstart = loadingState(files[0].name);
			reader.onload = loadedState(files[0].name);
			reader.readAsArrayBuffer(files[0]);
		}
	};

	return {
		init: function(document, FR) {
			FileReader = FR;
			document.body.addEventListener('drop', function(e) {
				e.preventDefault();
			}, false);
			var dropElement = document.getElementById('drop-file');

			$('#upload-wrapper #cancel-file').click(function(e) {
				e.preventDefault();
				loadState();
			});

			$('#upload-wrapper #file').click(function(e) {
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
		}
	};
})(require);