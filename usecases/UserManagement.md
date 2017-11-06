# Prerequisites

The user has either supplier-admin, customer-admin or global admin role.

# List existing users

The admin user is able to bring up a list of users that are assigned to his/her tenant (or all users in case of admin).
This is possible via main menu: Company/User Management
And for global Admin via main menu: Administration/User Management

The list is a table with columns
UserId, First Name, Last Name, TenantId, FederationId, Status, RegisteredOn, Language, Roles, Actions

The table allows paging/sorting/filtering.

# Actions

## Details

The admin user is able to inspect/edit the full user profile as modal 

## Deactivate

The admin user can deactivate the user.
The user will stay in the list, but not be able to login anymore.
(deleting would allow noew users to register reusing deleted users id and potentially associate previous user's data)

## Reset Password

The admin user can trigger new password to be generated and sent to users email.

## Activate

The admin user can activate users again.


