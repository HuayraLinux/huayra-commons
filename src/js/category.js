module.exports = (function() {
	'use strict';

	var $, document;

	var Category = function(categoryName, $categoriesWrapper) {
		this
			.setName(categoryName)
			._buildDom()
			.appendTo($categoriesWrapper);
		Category.add(this);
	};
	Category.prototype._buildDom = function() {
		var that = this;
		this.$dom = $(document.createElement('div'));
		var $text = $(document.createElement('span'))
			.text(this.getName())
			.appendTo(this.$dom);

		// TODO: agregar status (con validación con webworkerts, etc)

		var $removeButton = $(document.createElement('a'))
			.attr('href', '#')
			.click(function(e) {
				e.preventDefault();
				that.remove();
			})
			.text('x')
			.attr('title', 'Quitar')
			.appendTo(this.$dom);
		return this;
	};
	Category.prototype.appendTo = function($wrapper) {
		this.$dom.appendTo($wrapper);
		return this;
	};
	Category.prototype.setName = function(categoryName) {
		if(typeof categoryName != 'string') {
			throw 'El nombre de la categoría debe ser un string';
		}
		if(categoryName.length < 3) {
			throw 'El nombre de la categoría debe tener al menos 3 caracteres';
		}
		if(Category.find(categoryName)) {
			throw 'El archivo ya está categorizado con la categoría "' + categoryName + '"';
		}
		this._name = categoryName;
		return this;
	};
	Category.prototype.getName = function() {
		return this._name;
	};
	Category.prototype.remove = function() {
		this.$dom.remove();
		Category.remove(this);
		return this;
	};

	Category.reset = function() {
		this._categories = [];
	};
	Category.getAll = function() {
		return this._categories;
	};
	Category.find = function(categoryName) {
		return this._categories.find(function(aCategory) {
			return aCategory.getName().toUpperCase() == categoryName.toUpperCase();
		});
	};
	Category.add = function(aCategory) {
		this._categories.push(aCategory);
		return this;
	};
	Category.remove = function(aCategory) {
		var idx;
		while((idx = this._categories.indexOf(aCategory)) != -1) {
			this._categories.splice(idx, 1);
		}
		return this;
	};
	Category.configure = function(jQuery, doc) {
		$ = jQuery;
		document = doc;

		this.reset();
	};

	return Category;
})();