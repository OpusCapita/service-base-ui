import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import Layout from './Layout.react';
import UserRoleEditor from '../src/client/components/UserRoleEditor';
import UserProfileEditor from '../src/client/components/UserProfileEditor';

const actionUrl = 'http://localhost:8080',
	userId = 'john.doe@ncc.com';

const activeStyle = {color:' #ffffff', background: '#006677'};

const renderUserProfileEditor = () => (
	<UserProfileEditor
		actionUrl={actionUrl}
		userId={userId}
		dateTimePattern="MM/dd/yyyy"
		onUpdate={() => {}}
		onChange={() => {}}
	/>
);

const renderUserRoleEditor = () => (
	<UserRoleEditor
		readOnly={false}
		actionUrl={actionUrl}
		userId={userId}
		locale="en"
	/>
);


const App = () => (
	<Layout>
		<ul className="nav nav-tabs">
			<li><NavLink exact activeStyle={activeStyle} to='/user'>User profile</NavLink></li>
			<li><NavLink activeStyle={activeStyle} to='/user/roles'>User roles</NavLink></li>
		</ul>
		<Route exact path='/user' render={renderUserProfileEditor} />
		<Route exact path='/user/roles' render={renderUserRoleEditor} />
	</Layout>
);

export default App;
