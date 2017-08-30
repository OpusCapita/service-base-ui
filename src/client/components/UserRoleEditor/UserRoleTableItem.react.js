import React from 'react';
import Button from 'react-bootstrap/lib/Button';


const UserRoleTableItem = ({ roleId, onDelete }, context) => (
	<tr>
		<td>{roleId}</td>
		<td className="text-right">
			{onDelete &&
				<nobr>
					<Button onClick={onDelete} bsSize="sm">
						<span className="glyphicon glyphicon-trash" />
						&nbsp;{context.i18n.getMessage('UserRoleTable.Item.Button.delete')}
					</Button>
				</nobr>}
		</td>
	</tr>
);


UserRoleTableItem.propTypes = {
	roleId: React.PropTypes.string.isRequired,
	onDelete: React.PropTypes.func
};


UserRoleTableItem.contextTypes = {
	i18n: React.PropTypes.object.isRequired
};


export default UserRoleTableItem;