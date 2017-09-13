import React, { Component, PropTypes } from 'react';
import request from 'superagent-bluebird-promise';
import Button from 'react-bootstrap/lib/Button';
import ReactTable from 'react-table';
import Alert from '../Alert';
import i18nMessages from './i18n';
import 'react-table/react-table.css';
import './UserList.css';

const getUserStatusLabelClassName = (status) => {
	switch (status) {
		case 'emailVerification':
		case 'firstLogin':
			return 'default';

		case 'failedLogin':
			return 'warning';

		case 'deleted':
		case 'locked':
			return 'danger';

		case 'active': return 'success';

		default:
			return 'default';
	}
};

const shouldShowGenerateNewPasswordAction = ({ status }) => {
	return status !== 'locked' && status !== 'deleted';
};

class UserList extends Component {

	static propTypes = {
		actionUrl: PropTypes.string.isRequired,
		onUnauthorized: PropTypes.func
	};

	static contextTypes = {
		i18n: PropTypes.object.isRequired
	};

	loadUsersPromise = null;

	state = {
		users: [],
		loading: false
	};

	componentWillMount() {
		this.context.i18n.register('UserList', i18nMessages);
	}

	componentDidMount() {
		this.loadUsers();
	}

	componentWillUnmount() {
		if (!this.state.loading) {
			if (this.loadUsersPromise) {
				this.loadUsersPromise.cancel();
			}
		}
	}

	/**
	 * Loads user profile from api.
	 */
	loadUsers() {
		this.setState({ loading: true });

		this.loadUserProfilePromise = request
			.get(`${this.props.actionUrl}/user/users`)
			.set('Accept', 'application/json')
			.promise()
			.then((response) => {
				const users = response.body;

				return Promise.all(users.map(user => this.loadUserProfile(user.id)))
					.then((profiles) => {
						users.forEach((user, i) => user.profile = profiles[i]);
						return users;
					});
			})
			.then(users => this.setState({ users }))
			.catch((error) => {
				if (error.status === 401) {
					this.props.onUnauthorized();
				}
			})
			.then(() => this.setState({ loading: false }));
	}

	loadUserProfile(userId) {
		return request
			.get(`${this.props.actionUrl}/user/users/${encodeURIComponent(userId)}/profile`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => response.body)
			.catch((error) => {
				if (error.status === 404) {
					return {};
				}

				throw error;
			});
	}

	render() {
		const i18n = this.context.i18n.getMessage.bind(this.context.i18n);

		return (
			<div>
				<h4 className="tab-description">{this.context.i18n.getMessage('UserList.Title')}</h4>

				<ReactTable
					data={ this.state.users }
					className="user-list-table"
					columns={[
						{
							accessor: 'id',
							Header: i18n('UserList.Table.Id.Title')
						},
						{
							id: 'email',
							accessor: user => user.profile.email,
							Header: i18n('UserList.Table.Email.Title')
						},
						{
							id: 'firstName',
							accessor: user => user.profile.firstName,
							Header: i18n('UserList.Table.FirstName.Title')
						},
						{
							id: 'lastName',
							accessor: user => user.profile.lastName,
							Header: i18n('UserList.Table.LastName.Title')
						},
						{
							accessor: 'federationId',
							Header: i18n('UserList.Table.FederationId.Title')
						},
						{
							accessor: 'roles',
							Header: i18n('UserList.Table.Roles.Title'),
							Cell: ({ value }) => value.map(role =>
								<span key={role} className="label label-default">
									{i18n(`UserList.Table.Roles.Value.${role}`)}
								</span>)
						},
						{
							accessor: 'status',
							Header: i18n('UserList.Table.Status.Title'),
							Cell: ({ value }) =>
								<span className={`label label-${getUserStatusLabelClassName(value)}`}>
									{i18n(`UserList.Table.Status.Value.${value}`)}
								</span>
						},
						{
							id: 'actions',
							accessor: user => user,
							Cell: ({ value }) =>
								<nobr>
									{shouldShowGenerateNewPasswordAction(value) &&
										<Button onClick={() => {}} bsSize="sm">
											<span className="glyphicon glyphicon-envelope" />
											&nbsp;{i18n('UserList.Table.Actions.GenerateNewPassword')}
										</Button>}
								</nobr>
						}
					]}
				/>
			</div>
		);
	}
}

export default UserList;
