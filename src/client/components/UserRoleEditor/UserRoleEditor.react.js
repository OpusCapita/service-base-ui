import React, { Component } from 'react';
import request from 'superagent-bluebird-promise';
import i18nMessages from './i18n';
import UserRoleListTable from './UserRoleListTable.react';

class UserRoleEditor extends Component {

	static propTypes = {
		actionUrl: React.PropTypes.string.isRequired,
		userId: React.PropTypes.string.isRequired,
		readOnly: React.PropTypes.bool,
		onChange: React.PropTypes.func,
		onUnauthorized: React.PropTypes.func
	};

	static contextTypes = {
		i18n: React.PropTypes.object.isRequired
	};

	loadRolesPromise = null;

	static defaultProps = {
		readOnly: false,
		onChange: function(event) {
			if (event.isDirty) {
				console.log('data in form changed');
			} else {
				console.log('data in form committed or canceled')
			}
		}
	};

	state = {
		isLoaded: false,
		userRoles: [],
		loadErrors: false
	};

	componentWillMount(){
		this.context.i18n.register('UserRoleEditor', i18nMessages);
	}

	componentDidMount() {
		if (this.state.isLoaded) {
			return;
		}

		this.loadRolesPromise = request
			.get(`${this.props.actionUrl}/user/users/${encodeURIComponent(this.props.userId)}`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => {
				this.setState({
					isLoaded: true,
					userRoles: response.body.roles
				});
			})
			.catch(errors => {
				if (errors.status === 401) {
					this.props.onUnauthorized();
					return;
				}

				this.setState({
					isLoaded: true
				});
			});
	}

	componentWillUnmount() {
		if (!this.state.isLoaded) {
			if (this.loadRolesPromise) {
				this.loadRolesPromise.cancel();
			}
		}
	}

	render() {
		return (
			<div>
				<div>
					<h4 className="tab-description">{this.context.i18n.getMessage('UserRoleEditor.Title')}</h4>
					<UserRoleListTable
						actionUrl={this.props.actionUrl}
						userRoles={this.state.userRoles}
						onDelete={() => {}}
						readOnly={this.props.readOnly}
					/>
				</div>
			</div>
		);
	}
}

export default UserRoleEditor;
