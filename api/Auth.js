const { ApiBase } = require('./ApiBase');

class Auth extends ApiBase
{
    refreshIdToken()
    {
        return this.ajax.post('/refreshIdToken').set('Content-Type', 'application/json')
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    getUserData()
    {
        return this.ajax.get('/auth/userdata')
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Auth;
