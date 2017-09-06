import React, { Component, PropTypes } from 'react';
import request from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import userProfileValidator from '../../utils/validatejs/userProfileValidator';
import Alert from '../Alert';
import DateInput from '@opuscapita/react-dates/lib/DateInput';
import AttributeValueEditorRow from './AttributeValueEditorRow.react';
import UserProfileConstraints from './UserProfileConstraints';
import formI18nMessages from './i18n';
import validationI18nMessages from '../../utils/validatejs/i18n';
import './UserProfileEditor.css';

const DATE_TIME_PATTERN = 'MM/dd/yyyy';

class UserProfileEditor extends Component {

	static propTypes = {
		actionUrl: PropTypes.string.isRequired,
		userId: React.PropTypes.string.isRequired,
		readOnly: React.PropTypes.bool,
		onUnauthorized: React.PropTypes.func,
		onUpdate: React.PropTypes.func.isRequired,
		onChange: React.PropTypes.func.isRequired
	};

	static contextTypes = {
		i18n: React.PropTypes.object.isRequired
	};

	static defaultProps = {
		readOnly: false
	};

	loadUserProfilePromise = null;
	updateUserProfilePromise = null;

	state = {
		userProfile: {},
		isLoaded: false,
		errors: {}
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

		this.context.i18n.register('UserProfileEditor', formI18nMessages);
		this.context.i18n.register('validatejs', validationI18nMessages);

		this.validator = userProfileValidator(this.context.i18n);
		this.constraints = UserProfileConstraints(this.context.i18n);
	}

	componentDidMount() {
		this.loadUserProfile();
	}

	componentWillReceiveProps(nextProps, nextContext) {
		this.validator = userProfileValidator(nextContext.i18n);
		this.constraints = UserProfileConstraints(nextContext.i18n);
	}

	/**
	 * Loads user profile from api.
	 */
	loadUserProfile() {
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
	}


	updateUserProfile() {
		this.updateUserProfilePromise = request.put(`${this.props.actionUrl}/user/users/${this.props.userId}/profile`)
			.set('Accept', 'application/json')
			.send(this.state.userProfile)
			.promise()
			.then((response) => {
				const message = this.context.i18n.getMessage('UserProfileEditor.Message.updated');

				this.setState({
					userProfile: response.body,
					globalMessage: message
				});
			}).catch((error) => {
				if (error.status === 401) {
					this.props.onUnauthorized();
				}

				console.error(error);
			});
	}


	componentWillUnmount() {
		if (!this.state.isLoaded) {
			if (this.loadUserProfilePromise) {
				this.loadUserProfilePromise.cancel();
			}
		}
	}

	handleUpdate = (event) => {
		event.preventDefault();

		const errors = this.validator(
				this.state.userProfile,
				this.constraints,
				{ fullMessages: false }
			);

		if (!errors) {
			this.updateUserProfile();
		} else {
			Object.keys(errors)
				.forEach(field => errors[field] = errors[field].map(message => ({ message })));

			this.setState({ errors });
		}
	};

	handleChange(fieldName, event) {
		const newValue = event && event.target
			? event.target.value
			: event;

		if (this.props.onChange) {
			this.props.onChange(fieldName, this.state.userProfile[fieldName], newValue);
		}

		this.setState({
			userProfile: {
				...this.state.userProfile,
				[fieldName]: newValue
			}
		});
	}

	handleBlur = (fieldName) => {
		const errors = this.validator(
			this.state.userProfile,
			{ [fieldName]: this.constraints[fieldName] },
			{ fullMessages: false }
		);

		this.setState({
			errors: {
				...this.state.errors,
				[fieldName]: errors ?
					errors[fieldName].map(msg => ({ message: msg })) :
					[]
			}
		});
	};

	renderField = attrs => {
		const { userProfile, errors } = this.state;
		const { fieldName } = attrs;
		const fieldNames = attrs.fieldNames || [fieldName];

		const component = attrs.component ||
			<input className="form-control"
			       type="text"
			       value={ typeof userProfile[fieldName] === 'string' ? userProfile[fieldName] : '' }
			       onChange={ this.handleChange.bind(this, fieldName) }
			       onBlur={ this.handleBlur.bind(this, fieldName) }
			/>;

		let isRequired = fieldNames.some(name => {
			return this.constraints[name] && this.constraints[name].presence;
		});

		let rowErrors = fieldNames.reduce(
			(rez, name) => rez.concat(errors[name] || []),
			[]
		);

		return (
			<AttributeValueEditorRow
				labelText={ this.context.i18n.getMessage(`UserProfileEditor.Form.${fieldName}.label`) }
				required={ isRequired }
				rowErrors={ rowErrors }
			>
				{ component }
			</AttributeValueEditorRow>
		);
	};

	get salutationOptions() {
		return [
			{ value: 'Mr', label: this.context.i18n.getMessage('UserProfileEditor.Form.salutation.options.Mr') },
			{ value: 'Mrs', label: this.context.i18n.getMessage('UserProfileEditor.Form.salutation.options.Mrs') },
			{ value: 'Ms', label: this.context.i18n.getMessage('UserProfileEditor.Form.salutation.options.Ms') }
		];
	}

	render() {
		const { CountryField, LanguageField } = this.externalComponents;
		const userProfile = this.state.userProfile;

		return (
			<div>
				<h4 className="tab-description">{this.context.i18n.getMessage('UserProfileEditor.Title', { userId : this.props.userId })}</h4>

				{this.state.globalMessage &&
					<Alert bsStyle="info" message={this.state.globalMessage}/>}

				<form className="form-horizontal" onSubmit={this.handleUpdate}>
					{ this.renderField({
						fieldName: 'languageId',
						component: (
							<LanguageField
								actionUrl={this.props.actionUrl}
								value={userProfile.languageId}
								onChange={this.handleChange.bind(this, 'languageId')}
								onBlur={this.handleBlur.bind(this, 'languageId')}
							/>
						)
					}) }

					{ this.renderField({
						fieldName: 'countryId',
						component: (
							<CountryField
								actionUrl={this.props.actionUrl}
								value={userProfile.countryId}
								onChange={this.handleChange.bind(this, 'countryId')}
								onBlur={this.handleBlur.bind(this, 'countryId')}
							/>
						)
					}) }

					{ this.renderField({
						fieldName: 'salutation',
						component: (
							<select className="form-control"
						        value={ userProfile.salutation }
						        onChange={ this.handleChange.bind(this, 'salutation') }
					            onBlur={this.handleBlur.bind(this, 'salutation')}
							>
								{this.salutationOptions.map(({ label, value }, i) => {
									return (<option key={ i } value={ value }>{ label }</option>);
								})}
							</select>
						)
					}) }

					{ this.renderField({ fieldName: 'firstName' }) }

					{ this.renderField({ fieldName: 'lastName' }) }

					{ this.renderField({
						fieldName: 'birthday',
						component: (
							<DateInput
								className="form-control"
								locale={this.context.i18n.locale}
								dateFormat={DATE_TIME_PATTERN}
								value={userProfile.birthday && new Date(userProfile.birthday)}
								onChange={this.handleChange.bind(this, 'birthday')}
								onBlur={this.handleBlur.bind(this, 'birthday')}
								variants={[]}
							/>
						)
					}) }

					{ this.renderField({ fieldName: 'degree' }) }

					{ this.renderField({ fieldName: 'phoneNo' }) }

					{ this.renderField({ fieldName: 'faxNo' }) }

					{ this.renderField({ fieldName: 'department' }) }

					{ this.renderField({ fieldName: 'building' }) }

					{ this.renderField({ fieldName: 'floor' }) }

					{ this.renderField({ fieldName: 'room' }) }

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
