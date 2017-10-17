import React from 'react';
import PropTypes from 'prop-types';
import crypto from 'crypto';

class ContextComponent extends React.Component
{
    static contextTypes = {
        router : PropTypes.object.isRequired,
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        showModalDialog: PropTypes.func.isRequired,
        hideModalDialog: PropTypes.func.isRequired,
        userData : PropTypes.object.isRequired,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired,
        setLocale: PropTypes.func.isRequired,
        showSpinner : PropTypes.func.isRequired,
        hideSpinner : PropTypes.func.isRequired
    }

    getComponentId()
    {
        if(!this.componentId)
        {
            const location = this.context.router.location;
            const key = location.basename + location.pathname + this.constructor.name + Math.random();
            const hash = crypto.createHash('md5').update(key).digest('hex');

            this.componentId = hash.substr(0, 5) + hash.substr(-5);
        }

        return this.componentId;
    }
}

export default ContextComponent;
