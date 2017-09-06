const validatejs = {
	invalid: {
		maxSize: {},
	},
	blank: {},
	typeMismatch: {
		java: {
			util: {}
		},
	}
};

validatejs.invalid.maxSize.message = "Value exceeds the maximum size of '{limit}'";
validatejs.blank.message = "Field cannot be blank";
validatejs.typeMismatch.java.util.Date = "Value must be a valid Date";

export default {
	validatejs
};
