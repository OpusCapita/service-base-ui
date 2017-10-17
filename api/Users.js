const { ApiBase } = require('./ApiBase');

class Users extends ApiBase
{
    updateUserProfile(id, profile)
    {
        return this.ajax.put(`/user/api/users/${id}/profile`).set('Content-Type', 'application/json')
            .send(profile).then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Users;
