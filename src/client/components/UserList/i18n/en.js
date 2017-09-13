export default {
	UserList: {
		Title: 'User list',
		Table: {
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
				Value: {
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
				Value: {
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
				GenerateNewPassword: 'Send new password'
			}
		}
	}
};