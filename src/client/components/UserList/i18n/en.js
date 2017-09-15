export default {
	UserList: {
		Title: 'User list',
		Table: {
			Loading: 'Loading...',
			NoData: 'No users found',
			Pagination: {
				Previous: 'Previous',
				Next: 'Next',
				Page: 'Page',
				Of: 'of',
				Rows: 'rows'
			},
			Column: {
				Id: {
					Title: 'Id'
				},
				Email: {
					Title: 'Email'
				},
				FirstName: {
					Title: 'First name'
				},
				LastName: {
					Title: 'Last name'
				},
				Status: {
					Title: 'Status',
					Values: {
						'emailVerification': 'email verification',
						'firstLogin': 'first login',
						'active': 'active',
						'failedLogin': 'failed login',
						'locked': 'locked',
						'deleted': 'deleted'
					}
				},
				Roles: {
					Title: 'Roles',
					Values: {
						user: 'user',
						supplier: 'supplier',
						admin: 'admin',
						'supplier-admin': 'supplier-admin',
						'customer-admin': 'customer-admin',
						'invoice-inspector': 'invoice-inspector',
						'invoice-approver': 'invoice-approver'
					}
				},
				FederationId: {
					Title: 'Federation'
				},
				Actions: {
					Lock: 'Lock',
					Unlock: 'Unlock',
					ResetPassword: 'Reset password'
				}
			}
		}
	}
};