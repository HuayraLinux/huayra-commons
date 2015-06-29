module.exports = (function(require) {
	'use strict';

	require('array.prototype.find');
	var mediaWiki = require('./mediaWiki'),
		levenshtein = require('./levenshtein'),
		fs = require('fs');
	
	return {
		_initCallbacks: [],
		init: function() {
			var that = this;

			fs.readFile('./categories.json', {
				encoding: 'utf8'
			}, function(err, data) {
				if(err) {
					console.error(err);
					return;
				}
				that._data = JSON.parse(data);
				that._initted();
			});

			mediaWiki.getCategories().then(function(categories) {
				console.log('Nueva versión de las categorías');
				fs.writeFileSync('categories.json', JSON.stringify(categories));
			});
		},
		getAll: function() {
			return this._data;
		},
		find: function(categoryName) {
			this._validateSearch(categoryName);
			return this._data.find(function(aCategoryName) {
				return aCategoryName.toUpperCase() == categoryName.toUpperCase();
			});
		},
		findSimilar: function(categoryName) {
			this._validateSearch(categoryName);
			this._data.map(function(aCategoryName) {
				return {
					category: aCategoryName,
					levenshtein: levenshtein(categoryName.toUpperCase(), aCategoryName.toUpperCase())
				};
			}).sort(function(a, b) {
				return a.levenshtein - b.levenshtein;
			}).map(function(a) {
				return a.levenshtein;
			});
		},
		add: function(categoryName) {
			if(this.find(categoryName)) {
				return this;
			}
			this._data.push(categoryName);
			return this;
		},
		_validateSearch: function(categoryName) {
			if(!this._data) {
				throw 'No se cargaron las categorías aún.';
			}
			if(typeof categoryName != 'string') {
				throw 'Se debe buscar la categoría con un string';
			}
			if(categoryName.length < 3) {
				throw 'La categoría a buscar debe tener al menos 3 caracteres';
			}
			return this;
		},
		ready: function(aCallback) {
			if(!this._data) {
				this._initCallbacks.push(aCallback);
			}
			else {
				aCallback(this);
			}
			return this;
		},
		_initted: function() {
			var that = this;
			this._initCallbacks.forEach(function(aCallback) {
				return aCallback(that);
			});
			return this;
		}
	};
})(require);