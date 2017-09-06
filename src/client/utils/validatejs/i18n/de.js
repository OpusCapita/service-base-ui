const validatejs = {
	invalid: {
		maxSize: {}
	},
	blank: {},
	typeMismatch: {
		java: {
			util: {}
		}
	}
};

validatejs.invalid.maxSize.message = "Der Wert \u00fcbersteigt den H\u00f6chstwert von '{limit}'";
validatejs.blank.message = "Das Feld darf nicht leer sein";
validatejs.typeMismatch.java.util.Date = "Die Wert muss ein g\u00fcltiges Datum sein";

export default {
	validatejs
};
