import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import Layout from './Layout.react';
import UserRoleEditor from '../src/client/components/UserRoleEditor';
import UserProfileEditor from '../src/client/components/UserProfileEditor';
import UserList from '../src/client/components/UserList';

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


const renderUserList = () => (
	<UserList
		actionUrl={actionUrl}
	/>
);


const App = () => (
	<Layout>
		<ul className="nav nav-tabs">
			<li><NavLink exact activeStyle={activeStyle} to='/user'>Users</NavLink></li>
			<li><NavLink activeStyle={activeStyle} to='/user/roles'>User roles</NavLink></li>
			<li><NavLink activeStyle={activeStyle} to='/user/profile'>User profile</NavLink></li>
		</ul>
		<Route exact path='/user' render={renderUserList} />
		<Route exact path='/user/roles' render={renderUserRoleEditor} />
		<Route exact path='/user/profile' render={renderUserProfileEditor} />
	</Layout>
);

export default App;
