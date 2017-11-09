import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';

const UserRoleTable = ({ children }, context) => (
	<table className="table">
		<thead>
		<tr>
			<th>{context.i18n.getMessage('UserRoleTable.Header.name')}</th>
			<th>&nbsp;</th>
		</tr>
		</thead>
		<tbody>
			{children}
		</tbody>
	</table>
);


UserRoleTable.contextTypes = {
	i18n: React.PropTypes.object.isRequired
};


export default UserRoleTable;
