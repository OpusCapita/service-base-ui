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

	componentWillUnmount() {
		if (!this.state.loading) {
			if (this.loadUsersPromise) {
				this.loadUsersPromise.cancel();
			}
		}
	}

	/**
	 * Loads users list from api.
	 */
	loadUsers = (state, instance) => {
		this.setState({ loading: true });

		this.loadUserProfilePromise = request
			.get(`${this.props.actionUrl}/user/users?include=profile`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => response.body)
			.then(users => this.setState({ users }))
			.catch((error) => {
				if (error.status === 401) {
					this.props.onUnauthorized();
				}
			})
			.then(() => this.setState({ loading: false }));
	};

	render() {
		const i18n = this.context.i18n.getMessage.bind(this.context.i18n);
		const { loading, users } = this.state;

		return (
			<div>
				<h4 className="tab-description">{i18n('UserList.Title')}</h4>

				<ReactTable
					className="user-list-table"

					data={ users }
					onFetchData={this.loadUsers}
					loading={loading}

					defaultSorted={[
						{ id: 'id', desc: false }
					]}

					loadingText={i18n('UserList.Table.Loading')}
					noDataText={i18n('UserList.Table.NoData')}
					previousText={i18n('UserList.Table.Pagination.Previous')}
					nextText={i18n('UserList.Table.Pagination.Next')}
					pageText={i18n('UserList.Table.Pagination.Page')}
					ofText={i18n('UserList.Table.Pagination.Of')}
					rowsText={i18n('UserList.Table.Pagination.Rows')}

					columns={[
						{
							accessor: 'id',
							Header: i18n('UserList.Table.Column.Id.Title')
						},
						{
							id: 'email',
							accessor: user => user.profile ? user.profile.email : '',
							Header: i18n('UserList.Table.Column.Email.Title')
						},
						{
							id: 'firstName',
							accessor: user => user.profile ? user.profile.firstName : '',
							Header: i18n('UserList.Table.Column.FirstName.Title')
						},
						{
							id: 'lastName',
							accessor: user => user.profile ? user.profile.lastName : '',
							Header: i18n('UserList.Table.Column.LastName.Title')
						},
						{
							accessor: 'federationId',
							Header: i18n('UserList.Table.Column.FederationId.Title')
						},
						{
							accessor: 'roles',
							Header: i18n('UserList.Table.Column.Roles.Title'),
							Cell: ({ value }) => value.map(role =>
								<span key={role} className="label label-default">
									{i18n(`UserList.Table.Column.Roles.Values.${role}`)}
								</span>)
						},
						{
							accessor: 'status',
							Header: i18n('UserList.Table.Column.Status.Title'),
							Cell: ({ value }) =>
								<span className={`label label-${getUserStatusLabelClassName(value)}`}>
									{i18n(`UserList.Table.Column.Status.Values.${value}`)}
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
											&nbsp;{i18n('UserList.Table.Column.Actions.GenerateNewPassword')}
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
