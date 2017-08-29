import React from 'react';
import Layout from './Layout.react';
import UserRoleEditor from '../src/client/components/UserRoleEditor';

const actionUrl = 'http://localhost:8080',
	userId = 'john.doe@ncc.com';

const App = () => (
	<Layout>
		<UserRoleEditor
			readOnly={false}
			actionUrl={actionUrl}
			userId={userId}
			locale='en'
		/>
	</Layout>
);

export default App;
