const { ApiBase } = require('./ApiBase');

class Acl extends ApiBase
{
    getResourceGroups()
    {
        return this.ajax.get(`/acl/api/resourceGroups?type=ui`).then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    getPermissions(roles, service = null)
    {
        if(!Array.isArray(roles))
            roles = [ roles ];

        return Promise.all(roles.map(role => this.getPermission(role, service)));
    }

    getPermission(role, service = null)
    {
        if(service)
            return this.ajax.get(`/acl/api/permissions/${role}/${service}`).then(res => res && res.body).catch(this.getErrorFromResponse);
        else
            return this.ajax.get(`/acl/api/permissions/${role}`).then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Acl;
