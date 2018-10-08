const { ApiBase } = require('./ApiBase');

class Users extends ApiBase
{
    updateUser(userId, user)
    {
        return this.ajax.put(`/user/api/users/${userId}`).set('Content-Type', 'application/json')
            .send(user).then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    updateUserProfile(userId, profile)
    {
        return this.ajax.put(`/user/api/users/${userId}/profile`).set('Content-Type', 'application/json')
            .send(profile).then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    getUserProfile(userId)
    {
        return this.ajax.get(`/user/api/users/${userId}/profile`)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Users;
