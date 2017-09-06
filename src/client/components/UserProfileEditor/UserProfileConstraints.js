module.exports = function(i18n) {
	return {
		"languageId": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			}
		},
		"countryId": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			}
		},
		"salutation": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			}
		},
		"firstName": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			},
			length: {
				maximum: 50,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 50
				})
			}
		},
		"lastName": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			},
			length: {
				maximum: 50,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 50
				})
			}
		},
		"birthday": {
			datetime: {
				message: i18n.getMessage('validatejs.typeMismatch.java.util.Date')
			}
		},
		"degree": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			},
			length: {
				maximum: 20,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 20
				})
			}
		},
		"phoneNo": {
			length: {
				maximum: 20,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 20
				})
			}
		},
		"faxNo": {
			length: {
				maximum: 20,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 20
				})
			}
		},
		"department": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			},
			length: {
				maximum: 40,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 40
				})
			}
		},
		"building": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			},
			length: {
				maximum: 40,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 40
				})
			}
		},
		"floor": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			},
			length: {
				maximum: 40,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 40
				})
			}
		},
		"room": {
			presence: {
				message: i18n.getMessage('validatejs.blank.message')
			},
			length: {
				maximum: 40,
				tooLong: i18n.getMessage('validatejs.invalid.maxSize.message', {
					limit: 40
				})
			}
		}
	};
};
