import React from 'react';
import PropTypes from 'prop-types';
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
	roleId: PropTypes.string.isRequired,
	onDelete: PropTypes.func
};


UserRoleTableItem.contextTypes = {
	i18n: PropTypes.object.isRequired
};


export default UserRoleTableItem;