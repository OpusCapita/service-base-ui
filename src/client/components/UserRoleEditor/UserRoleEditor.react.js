import React, { Component } from 'react';
import request from 'superagent-bluebird-promise';
import i18nMessages from './i18n';
import UserRoleListTable from './UserRoleListTable.react';
import Button from 'react-bootstrap/lib/Button';

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

	loadOwnedRolesPromise = null;

	loadAssignableRolesPromise = null;

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
		ownedRoles: [],
		assignableRoles: [],
		loadErrors: false
	};

	componentWillMount(){
		this.context.i18n.register('UserRoleEditor', i18nMessages);
	}

	componentDidMount() {
		if (this.state.isLoaded) {
			return;
		}

		this.loadOwnedRolesPromise = request
			.get(`${this.props.actionUrl}/user/users/${encodeURIComponent(this.props.userId)}`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => this.setState({ownedRoles: response.body.roles}));

		this.loadAssignableRolesPromise = request
			.get(`${this.props.actionUrl}/user/users/${encodeURIComponent(this.props.userId)}/assignableRoles`)
			.set('Accept', 'application/json')
			.promise()
			.then(response => this.setState({assignableRoles: response.body}));


		Promise.all([this.loadOwnedRolesPromise, this.loadAssignableRolesPromise])
			.catch((errors) => {
				if (errors.status === 401) {
					this.props.onUnauthorized();
					return;
				}

				this.setState({loadErrors: true});
			})
			.then(() => this.setState({isLoaded: true}));
	}

	componentWillUnmount() {
		if (!this.state.isLoaded) {
			if (this.loadOwnedRolesPromise) {
				this.loadOwnedRolesPromise.cancel();
			}

			if (this.loadAssignableRolesPromise) {
				this.loadAssignableRolesPromise.cancel();
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
						userRoles={this.state.ownedRoles}
						onDelete={() => {}}
						readOnly={this.props.readOnly}
					/>
					<form className="form-inline" onSubmit={() => {}}>
						<div className="btn-group">
							<button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								Role <span className="caret"/>
							</button>
							<ul className="dropdown-menu">
								{this.state.assignableRoles.map((item, i) =>
									<li key={i}><a href="#">{item}</a></li>)}
							</ul>
						</div>
						<Button
							bsStyle="primary"
							type="submit">
							{this.context.i18n.getMessage('UserRoleEditor.Button.add')}
						</Button>
					</form>
				</div>
			</div>
		);
	}
}

export default UserRoleEditor;
