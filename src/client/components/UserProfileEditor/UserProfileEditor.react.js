import React, { Component } from 'react';
import request from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import DateInput from '@opuscapita/react-dates/lib/DateInput';
import AttributeValueEditorRow from './AttributeValueEditorRow.react';
import i18nMessages from './i18n';
import './UserProfileEditor.css';

const DATE_TIME_PATTERN = 'MM/dd/yyyy';

class UserProfileEditor extends Component {

	static propTypes = {
		actionUrl: React.PropTypes.string.isRequired,
		userId: React.PropTypes.string.isRequired,
		readOnly: React.PropTypes.bool,
		onUnauthorized: React.PropTypes.func
	};

	static contextTypes = {
		i18n: React.PropTypes.object.isRequired
	};

	static defaultProps = {
		readOnly: false
	};

	loadUserProfilePromise = null;

	state = {
		userProfile: {},
		isLoaded: false
	};

	componentWillMount() {
		const CountryField = serviceComponent({
			serviceRegistry: (service) => ({ url: `${this.props.actionUrl}/isodata` }),
			serviceName: 'isodata',
			moduleName: 'isodata-countries',
			jsFileName: 'countries-bundle'
		});

		const LanguageField = serviceComponent({
			serviceRegistry: (service) => ({ url: `${this.props.actionUrl}/isodata` }),
			serviceName: 'isodata',
			moduleName: 'isodata-languages',
			jsFileName: 'languages-bundle'
		});

		this.externalComponents = { CountryField, LanguageField };

		this.context.i18n.register('UserProfileEditor', i18nMessages);
	}

	componentDidMount() {
		this.loadUserProfile();
	}

	/**
	 * Loads user profile from api.
	 */
	loadUserProfile = () => {
		this.setState({ isLoaded: false });

		this.loadUserProfilePromise = request
			.get(`${this.props.actionUrl}/user/users/${encodeURIComponent(this.props.userId)}/profile`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => this.setState({userProfile: response.body}))
			.catch((error) => {
				if (error.status === 401) {
					this.props.onUnauthorized();
				}
			})
			.then(() => this.setState({ isLoaded: true }));
	};

	componentWillUnmount() {
		if (!this.state.isLoaded) {
			if (this.loadUserProfilePromise) {
				this.loadUserProfilePromise.cancel();
			}
		}
	}

	renderField = attrs => {
		const { userProfile } = this.state;
		const { fieldName } = attrs;
		const fieldNames = attrs.fieldNames || [fieldName];

		const component = attrs.component ||
			<input className="form-control"
			       type="text"
			       value={ typeof userProfile[fieldName] === 'string' ? userProfile[fieldName] : '' }
			/>;

		return (
			<AttributeValueEditorRow
				labelText={ this.context.i18n.getMessage(`UserProfileEditor.Form.${fieldName}.label`) }
				required={ false }
				rowErrors={ [] }
			>
				{ component }
			</AttributeValueEditorRow>
		);
	};

	render() {
		const { CountryField, LanguageField } = this.externalComponents;

		return (
			<div>
				<h4 className="tab-description">{this.context.i18n.getMessage('UserProfileEditor.Title', { userId : this.props.userId })}</h4>
				<form className="form-horizontal">
					{ this.renderField({ fieldName: 'firstName' }) }

					{ this.renderField({ fieldName: 'lastName' }) }

					{ this.renderField({
						fieldName: 'countryId',
						component: (
							<CountryField
								actionUrl={this.props.actionUrl}
								value={this.state.userProfile.countryId}
								onChange={() => {}}
							/>
						)
					}) }

					{ this.renderField({
						fieldName: 'languageId',
						component: (
							<LanguageField
								actionUrl={this.props.actionUrl}
								value={this.state.userProfile.languageId}
								onChange={() => {}}
							/>
						)
					}) }

					{ this.renderField({
						fieldName: 'birthday',
						component: (
							<DateInput
								className="form-control"
								locale={this.context.i18n.locale}
								dateFormat={DATE_TIME_PATTERN}
								value={this.state.userProfile.birthday}
								onChange={() => {}}
								variants={[]}
							/>
						)
					}) }

					<div className='user-profile-form-submit'>
						<div className='text-right form-submit'>
							<button className="btn btn-primary" onClick={null}>
								{ this.context.i18n.getMessage('UserProfileEditor.Button.save') }
							</button>
						</div>
					</div>
				</form>
			</div>
		);
	}
}

export default UserProfileEditor;
