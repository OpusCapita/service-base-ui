const { ApiBase } = require('./ApiBase');

class Notifications extends ApiBase
{
    getNotifications(status = 'new')
    {
        return this.ajax.get(`/notification/api/deliveries`).then(res => res && res.body.sort(this._sortByDate)).catch(this.getErrorFromResponse);
    }

    acknowledgeNotification(deliveryId)
    {
        return this.ajax.put(`/notification/api/deliveries/${deliveryId}/acknowledge`).then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    _sortByDate(a, b)
    {
        const dateA = new Date(a.createdOn);
        const dateB = new Date(b.createdOn);

        if(dateA < dateB)
            return -1;
        else if(dateA > dateB)
            return 1;
        else
            return 0;
    }
}

export default Notifications;
