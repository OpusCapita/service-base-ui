import React from 'react';
import Layout from './Layout.react';
import UserRoleEditor from '../src/client/components/UserRoleEditor';

const userId = 'john.doe@ncc.com';

const App = () => (
	<Layout>
		<UserRoleEditor
			readOnly={false}
			userId={userId}
			locale='en'
		/>
	</Layout>
);

export default App;
