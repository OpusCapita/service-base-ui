import { Acl } from '../api';

const actionsMap = {
    'POST': 'create',
    'GET': 'view',
    'PUT': 'edit',
    'DELETE': 'delete',
    'HEAD': 'head',
    'OPTIONS': 'options'
}

class Bouncer
{
    constructor()
    {
        this.acl = new Acl();
    }

    init(userData)
    {
        this.userData = userData;
        const roles = (userData && userData.roles) || [ ];

        return Promise.all([
            this.getPermissions(roles),
            this.getResourceGroups()
        ])
        .then(([permissions, resourceGroups]) =>
        {
            this.permissions = permissions;
            this.resourceGroups = resourceGroups;
        });
    }

    findResource(serviceName, url, method)
    {
        const userId = this.userData && this.userData.id;
        const cacheKey = `service-base-ui.${serviceName}${url}:${userId}`;
        const cached = this.getCachedValue(cacheKey);

        if(cached)
            return cached;

        const roles = (this.userData && this.userData.roles) || [ ];
        const prefixLength = serviceName.length + 1;
        const action = actionsMap[method.toUpperCase()];

        let foundResources = [ ];
        const permissions = this.permissions.filter(p => p.resourceGroupId.startsWith(serviceName));

        for(const i in permissions)
        {
            const permission = permissions[i];
            const resourceGroupName = permission.resourceGroupId.substring(prefixLength);

            if(resourceGroupName === '*')
            {
                foundResources = [ '*' ];
                break;
            }
            else
            {
                const foundResourceGroup = this.resourceGroups[serviceName] && this.resourceGroups[serviceName][resourceGroupName];
                const resources = foundResourceGroup && foundResourceGroup.resources;

                if(resources)
                    foundResources = foundResources.concat(resources.filter(r => url.match(new RegExp(this.replacePlaceholders(r.resourceId, this.userData))) && r.actions.indexOf(action) > -1));
            }
        }

        foundResources.length && this.setCachedValue(cacheKey, foundResources);

        return foundResources;
    }

    getPermissions(roles)
    {
        const cacheKey = 'service-base-ui.' + JSON.stringify(roles);
        const cached = this.getCachedValue(cacheKey);

        if(cached)
        {
            return Promise.resolve(cached);
        }
        else
        {
            return this.acl.getPermissions(roles).then(permissions =>
            {
                permissions = permissions.reduce((all, more) => all.concat(more), [ ]);

                this.setCachedValue(cacheKey, permissions);

                return permissions;
            });
        }
    }

    getResourceGroups()
    {
        const cacheKey = 'service-base-ui.resourceGroups';
        const cached = this.getCachedValue(cacheKey);

        if(cached)
        {
            return Promise.resolve(cached);
        }
        else
        {
            return this.acl.getResourceGroups().then(resourceGroups =>
            {
                const map = { };

                resourceGroups.forEach(rg =>
                {
                    const { serviceName, resourceGroupId, resources } = rg;

                    if(!map[serviceName])
                        map[serviceName] = { };

                    map[serviceName][resourceGroupId] = { resources };
                });

                this.setCachedValue(cacheKey, map);

                return map;
            });
        }
    }

    replacePlaceholders(resourceId, userData)
    {
        const tenantId = (userData.supplierid && 's_' + userData.supplierid)
            || (userData.customerid && 'c_' + userData.customerid);

        return resourceId.replace(/\${_current_tenant_id}/g, tenantId)
            .replace(/\${_current_user_id}/g, userData.id)
            .replace(/\${_current_customer_id}/g, userData.customerid)
            .replace(/\${_current_supplier_id}/g, userData.supplierid);
    }

    setCachedValue(key, value)
    {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    }

    getCachedValue(key)
    {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
}

export default Bouncer;
