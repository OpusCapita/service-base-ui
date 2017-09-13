import React, { Component, PropTypes } from 'react';
import request from 'superagent-bluebird-promise';
import Button from 'react-bootstrap/lib/Button';
import ReactTable from 'react-table';
import Alert from '../Alert';
import i18nMessages from './i18n';
import 'react-table/react-table.css';
import './UserList.css';

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
		return (
			<div>
				<h4 className="tab-description">{this.context.i18n.getMessage('UserList.Title')}</h4>

				<ReactTable
					data={ this.state.users }
					className="user-list-table"
					columns={[
						{
							id: 'email',
							accessor: user => user.profile.email,
							Header: this.context.i18n.getMessage('UserList.Column.Email.Title')
						},
						{
							id: 'firstName',
							accessor: user => user.profile.firstName,
							Header: this.context.i18n.getMessage('UserList.Column.FirstName.Title')
						},
						{
							id: 'lastName',
							accessor: user => user.profile.lastName,
							Header: this.context.i18n.getMessage('UserList.Column.LastName.Title')
						},
						{
							id: 'roles',
							accessor: user => user.roles,
							Header: this.context.i18n.getMessage('UserList.Column.Roles.Title'),
							Cell: props => props.value.map(role => <span className="label label-default">{role}</span>)
						}
					]}
				/>
			</div>
		);
	}
}

export default UserList;
