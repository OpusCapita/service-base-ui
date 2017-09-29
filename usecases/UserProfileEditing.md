# Prerequisites

Every user can do this.

# Access

User can access his/her profile via the user menu (drop down on user name / picture)

# Editor

Editor comes up as modal dialog.

Profile is editable by user, some fields may be excluded from being editable if mapped from federation claims, e.g. user first name, last name, email depending on federation config.

The user sees his profile as a form and is able to change editable fields.
User is also able to upload a personal avatar image.

Once user updates the profile, the JWT token in the session is refreshed so that new values can take immediate effect.

