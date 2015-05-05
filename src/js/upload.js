module.exports = (function(require) {
	'use strict';

	var $ = require('./jquery.min');

	return {
		init: function(document, FileReader) {
			document.body.addEventListener('drop', function(e) {
				e.preventDefault();
			}, false);
			var dropElement = document.getElementById('drop-file');
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
				var files = evt.dataTransfer.files;
				$(dropElement).removeClass('drop');

				if(files.length) {
					var reader = new FileReader();
					reader.onload = function(e) {
						$('#upload-wrapper #title').val($('#upload-wrapper #title').val() || files[0].name);
						// e.target.result
					};
					reader.onerror = function(e) {
						switch(e.target.error.code) {
							case e.target.error.NOT_FOUND_ERR:
								alert('File Not Found!');
								break;
							case e.target.error.NOT_READABLE_ERR:
								alert('File is not readable');
								break;
							case e.target.error.ABORT_ERR:
								break; // noop
							default:
								alert('An error occurred reading this file.');
						}
					};
					reader.onprogress = function(e) {
						if (e.lengthComputable) {
							if(e.total) {
								$('#loading #read-completed').text(Math.round((e.loaded / e.total) * 100) + '%');
							}
						}
					};
					reader.onabort = function(e) {
						$('#loading').hide();
						$(dropElement).show();
					};
					reader.onloadstart = function(e) {
						$('#loading').show();
						$(dropElement).hide();
					};
					reader.readAsArrayBuffer(files[0]);
				}
			}, false);
		}
	};
})(require);