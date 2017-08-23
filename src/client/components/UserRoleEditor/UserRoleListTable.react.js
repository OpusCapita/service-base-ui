import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';

class UserRoleListTable extends Component {
	static propTypes = {
		actionUrl: React.PropTypes.string.isRequired,
		userRoles: React.PropTypes.array.isRequired,
		onDelete: React.PropTypes.func.isRequired,
		readOnly: React.PropTypes.bool
	};

	static contextTypes = {
		i18n: React.PropTypes.object.isRequired
	};

	onDelete = (userRole) => {
		if (!confirm(this.context.i18n.getMessage('UserRoleListTable.Confirmation.delete'))) {
			return;
		}
		this.props.onDelete(userRole);
	};

	render() {
		const userRoles = this.props.userRoles;

		return (
			<table className="table">
				<thead>
				<tr>
					<th>{this.context.i18n.getMessage('UserRoleListTable.Header.name')}</th>
					<th>&nbsp;</th>
				</tr>
				</thead>
				<tbody>
				{
					userRoles.map((userRole, index) => {
							return (
								<tr key={'role-' + index}>
									<td>{userRole}</td>
									<td className="text-right">
										{!this.props.readOnly &&
											<nobr>
												<Button onClick={this.onDelete.bind(this, userRole)} bsSize="sm">
													<span className="glyphicon glyphicon-trash" />
													&nbsp;{this.context.i18n.getMessage('UserRoleListTable.Button.delete')}
												</Button>
											</nobr>}
									</td>
								</tr>
							);
						}
					)}
				</tbody>
			</table>
		);
	}
}

export default UserRoleListTable;
