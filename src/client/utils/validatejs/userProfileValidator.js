const validatejs = require('validate.js');

const isValidDate = function(d) {
	if (Object.prototype.toString.call(d) !== "[object Date]") {
		return false;
	}
	return !isNaN(d.getTime());
};

export default function(i18n) {
	validatejs.extend(validatejs.validators.datetime, {
		parse: function(value) {
			let date = new Date(value);
			if (isValidDate(date)) {
				return date.getTime();
			}
			return value.toString;
		},

		format: function(value) {
			const date = new Date(value);
			if (isValidDate(value)) {
				return i18n.formatDate(date);
			}
			return value;
		}
	});

	return validatejs;
};
