import React, { Component } from 'react';
import request from 'superagent-bluebird-promise';
import i18nMessages from './i18n';
import UserRoleTable from './UserRoleTable.react';
import UserRoleTableItem from './UserRoleTableItem.react';
import Button from 'react-bootstrap/lib/Button';
import Select from '@opuscapita/react-select';
import './UserRoleEditor.css';

class UserRoleEditor extends Component {

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

	loadOwnedRolesPromise = null;

	loadAssignableRolesPromise = null;

	state = {
		ownedRoles: [],
		assignableRoles: [],
		selectedRoleId: null
	};

	componentWillMount() {
		this.context.i18n.register('UserRoleEditor', i18nMessages);
	}

	componentDidMount() {
		this.loadRoles();
	}

	/**
	 * Loads owned and assignable roles from api.
	 */
	loadRoles = () => {
		this.setState({ isLoaded: false });

		this.loadOwnedRolesPromise = request
			.get(`${this.props.actionUrl}/user/users/${encodeURIComponent(this.props.userId)}`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => this.setState({ownedRoles: response.body.roles}));

		this.loadAssignableRolesPromise = request
			.get(`${this.props.actionUrl}/user/users/current/assignableRoles`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => this.setState({assignableRoles: response.body}));

		return Promise.all([this.loadOwnedRolesPromise, this.loadAssignableRolesPromise])
			.catch((error) => {
				if (error.status === 401) {
					this.props.onUnauthorized();
				}
			})
			.then(() => this.setState({ isLoaded: true }));
	};

	/**
	 * Add role form submit handler
	 * @param {object} event Form submit event object
	 */
	onSubmit = (event) => {
		event.preventDefault();

		if (!this.state.selectedRoleId) {
			return;
		}

		this.addRoleToUser(this.state.selectedRoleId)
			.then(() => this.setState({ selectedRoleId: null }));
	};

	/**
	 * Assigns given role to user.
	 * @param {string} roleId Role identifier
	 */
	addRoleToUser = (roleId) => {
		return request
			.put(`${this.props.actionUrl}/user/api/users/${encodeURIComponent(this.props.userId)}/roles/${roleId}`)
			.set('Accept', 'application/json')
			.set('Content-type', 'application/json')
			.promise()
			.then(this.loadRoles);
	};

	/**
	 * Removes given role to user.
	 * @param {string} roleId Role identifier
	 */
	removeRoleFromUser = (roleId) => {
		if (!confirm(this.context.i18n.getMessage('UserRoleEditor.Confirmation.delete'))) {
			return;
		}

		return request
			.delete(`${this.props.actionUrl}/user/api/users/${encodeURIComponent(this.props.userId)}/roles/${roleId}`)
			.set('Accept', 'application/json')
			.set('Content-type', 'application/json')
			.promise()
			.then(this.loadRoles);
	};

	componentWillUnmount() {
		if (!this.state.isLoaded) {
			if (this.loadOwnedRolesPromise) {
				this.loadOwnedRolesPromise.cancel();
			}

			if (this.loadAssignableRolesPromise) {
				this.loadAssignableRolesPromise.cancel();
			}
		}
	}

	/**
	 * Handles role switching.
	 */
	onRoleChange = (option) => {
		this.setState({ selectedRoleId: option.value });
	};

	/**
	 * Determines whether add button should be disabled or not
	 * @returns {boolean|*}
	 */
	get isAddRoleButtonDisabled() {
		return !this.state.selectedRoleId;
	}

	/**
	 * Roles which can be currently assigned.
	 * @returns {string[]}
	 */
	get assignableRoles() {
		return this.state.assignableRoles
			.filter(assignableRole => this.state.ownedRoles.indexOf(assignableRole) === -1)
	}

	/**
	 * Determines whether given role can be removed by current user.
	 * @param {string} roleId Role identifier which is to be removed
	 * @returns {boolean}
	 */
	isRoleRemovable(roleId) {
		return !this.props.readOnly && this.state.assignableRoles.indexOf(roleId) > -1;
	}

	render() {
		return (
			<div>
				<div>
					<h4 className="tab-description">{this.context.i18n.getMessage('UserRoleEditor.Title', { userId : this.props.userId })}</h4>

					<UserRoleTable>
						{this.state.ownedRoles.map(roleId =>
							<UserRoleTableItem
								key={`role-${roleId}`}
								roleId={roleId}
								onDelete={this.isRoleRemovable(roleId) ? this.removeRoleFromUser.bind(this, roleId) : null}
							/>)}
					</UserRoleTable>

					{!this.props.readOnly &&
						<form className="form-inline" onSubmit={this.onSubmit}>
							<div className="form-group">
								<Select
									className="add-role-form-select"
									value={this.state.selectedRoleId}
									onChange={this.onRoleChange}
									searchable={false}
									clearable={false}
									placeholder={this.context.i18n.getMessage('UserRoleEditor.AddRoleForm.placeholder')}
									noResultsText={this.context.i18n.getMessage('UserRoleEditor.AddRoleForm.noResults')}
									options={this.assignableRoles.map(roleId => ({value: roleId, label: roleId}))}
								/>
								<Button
									bsStyle="primary"
									type="submit"
									disabled={this.isAddRoleButtonDisabled}>
									{this.context.i18n.getMessage('UserRoleEditor.Button.add')}
								</Button>
							</div>
						</form>}
				</div>
			</div>
		);
	}
}

export default UserRoleEditor;
