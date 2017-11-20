import React from 'react';
import { Containers } from '@opuscapita/service-base-ui';
import UserRoleEditor from '../src/client/components/UserRoleEditor';
import { Route } from 'react-router';

const userId = 'john.doe@ncc.com';

const userRoleEditor = <UserRoleEditor
	readOnly={false}
	userId={userId}
/>;

const App = () => (
	<Containers.ServiceLayout serviceName="user">
		<Route path="/" component={() => userRoleEditor} />
	</Containers.ServiceLayout>
);

export default App;
