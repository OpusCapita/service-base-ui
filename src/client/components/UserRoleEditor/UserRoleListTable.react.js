import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';

class UserRoleListTable extends Component {
	static propTypes = {
		actionUrl: React.PropTypes.string.isRequired,
		ownedRoles: React.PropTypes.array.isRequired,
		assignableRoles: React.PropTypes.array.isRequired,
		onDelete: React.PropTypes.func.isRequired,
		readOnly: React.PropTypes.bool
	};

	static contextTypes = {
		i18n: React.PropTypes.object.isRequired
	};

	/**
	 * Handles role deletion.
	 * @param {string} roleId Role identifier
	 */
	onDelete(roleId) {
		if (!confirm(this.context.i18n.getMessage('UserRoleListTable.Confirmation.delete'))) {
			return;
		}

		this.props.onDelete(roleId);
	}

	render() {
		return (
			<table className="table">
				<thead>
				<tr>
					<th>{this.context.i18n.getMessage('UserRoleListTable.Header.name')}</th>
					<th>&nbsp;</th>
				</tr>
				</thead>
				<tbody>
					{this.props.ownedRoles.map((roleId, i) =>
						<tr key={`role-${i}`}>
							<td>{roleId}</td>
							<td className="text-right">
								{!this.props.readOnly && this.props.assignableRoles.indexOf(roleId) > -1 &&
									<nobr>
										<Button onClick={this.onDelete.bind(this, roleId)} bsSize="sm">
											<span className="glyphicon glyphicon-trash" />
											&nbsp;{this.context.i18n.getMessage('UserRoleListTable.Button.delete')}
										</Button>
									</nobr>}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		);
	}
}

export default UserRoleListTable;
