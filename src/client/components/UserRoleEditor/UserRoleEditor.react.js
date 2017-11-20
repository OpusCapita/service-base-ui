import React, { Component } from 'react';
import PropTypes from 'prop-types';
import request from 'superagent-bluebird-promise';
import i18nMessages from './i18n';
import Button from 'react-bootstrap/lib/Button';
import Select from '@opuscapita/react-select';
import { Components } from '@opuscapita/service-base-ui';
import './UserRoleEditor.css';

class UserRoleEditor extends Components.ContextComponent {

	static propTypes = {
		userId: PropTypes.string.isRequired,
		readOnly: PropTypes.bool
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

	componentWillReceiveProps(nextProps) {
		if (this.props.userId !== nextProps.userId) {
			this.loadRoles();
		}
	}

	/**
	 * Loads owned and assignable roles from api.
	 */
	loadRoles() {
		this.loadOwnedRolesPromise = request
			.get(`/user/api/users/${encodeURIComponent(this.props.userId)}`)
			.then(response => this.setState({ownedRoles: response.body.roles}));

		this.loadAssignableRolesPromise = request
			.get(`/user/api/users/current/assignableRoles`)
			.then(response => this.setState({assignableRoles: response.body}));

		return Promise.all([this.loadOwnedRolesPromise, this.loadAssignableRolesPromise]);
	};

	/**
	 * Add role form submit handler
	 * @param {object} event Form submit event object
	 */
	onSubmit(event) {
		event.preventDefault();

		if (this.state.selectedRoleId) {
			this.addRoleToUser(this.state.selectedRoleId)
				.then(() => this.setState({ selectedRoleId: null }));
		}
	};

	/**
	 * Assigns given role to user.
	 * @param {string} roleId Role identifier
	 */
	addRoleToUser(roleId) {
		return request
			.put(`/user/api/users/${encodeURIComponent(this.props.userId)}/roles/${roleId}`)
			.set('Content-type', 'application/json')
			.then(() => this.loadRoles());
	};

	/**
	 * Removes given role to user.
	 * @param {string} roleId Role identifier
	 */
	removeRoleFromUser(roleId) {
		this.context.showModalDialog(
			this.context.i18n.getMessage('UserRoleEditor.confirmation.delete.title'),
			this.context.i18n.getMessage('UserRoleEditor.confirmation.delete.message'),
			(button) => {
				if (button === 'yes') {
					request
						.delete(`/user/api/users/${encodeURIComponent(this.props.userId)}/roles/${roleId}`)
						.set('Content-type', 'application/json')
						.then(() => this.loadRoles());
				}

				return true;
			},
			{
				'yes': this.context.i18n.getMessage('UserRoleEditor.confirmation.delete.yes'),
				'no': this.context.i18n.getMessage('UserRoleEditor.confirmation.delete.no')
			}
		);
	};

	/**
	 * Handles role switching.
	 */
	onRoleChange(option) {
		this.setState({ selectedRoleId: option.value });
	};

	/**
	 * Determines whether add button should be disabled or not
	 * @returns {boolean|*}
	 */
	isAddRoleButtonDisabled() {
		return !this.state.selectedRoleId;
	}

	/**
	 * Roles which can be currently assigned.
	 * @returns {string[]}
	 */
	getAssignableRoles() {
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
		const i18n = this.context.i18n;

		return (
			<div>
				<div>
					<h4 className="tab-description">{i18n.getMessage('UserRoleEditor.title', { userId : this.props.userId })}</h4>

					<table className="table">
						<thead>
							<tr>
								<th>{i18n.getMessage('UserRoleEditor.table.header.name')}</th>
								<th>&nbsp;</th>
							</tr>
						</thead>
						<tbody>
							{this.state.ownedRoles.map(roleId =>
								<tr key={`role-${roleId}`}>
									<td>{roleId}</td>
									<td className="text-right">
										{this.isRoleRemovable(roleId) &&
											<nobr>
												<Button onClick={this.removeRoleFromUser.bind(this, roleId)} bsSize="sm">
													<span className="glyphicon glyphicon-trash" />
													&nbsp;{i18n.getMessage('UserRoleEditor.table.item.button.delete')}
												</Button>
											</nobr>}
									</td>
								</tr>)}
						</tbody>
					</table>

					{!this.props.readOnly &&
						<form className="form-inline" onSubmit={event => this.onSubmit(event)}>
							<div className="form-group">
								<Select
									className="add-role-form-select"
									value={this.state.selectedRoleId}
									onChange={option => this.onRoleChange(option)}
									searchable={false}
									clearable={false}
									placeholder={i18n.getMessage('UserRoleEditor.addRoleForm.placeholder')}
									noResultsText={i18n.getMessage('UserRoleEditor.addRoleForm.noResults')}
									options={this.getAssignableRoles().map(roleId => ({value: roleId, label: roleId}))}
								/>
								<Button
									bsStyle="primary"
									type="submit"
									disabled={this.isAddRoleButtonDisabled()}>
									{i18n.getMessage('UserRoleEditor.button.add')}
								</Button>
							</div>
						</form>}
				</div>
			</div>
		);
	}
}

export default UserRoleEditor;