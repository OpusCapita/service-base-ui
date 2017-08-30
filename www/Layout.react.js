import React, { PropTypes, Component } from 'react';
import { I18nManager } from '@opuscapita/i18n';

class Layout extends Component
{
	static childContextTypes = {
		i18n: PropTypes.object.isRequired
	};

	getChildContext() {
		return { i18n: new I18nManager({ locale: 'en' }) };
	}

	render() {
		return (<div>{this.props.children}</div>);
	}
};

export default Layout;
