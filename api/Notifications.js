'use strict';
const {ApiBase} = require('./ApiBase');


class Notifications extends ApiBase {
    constructor() {
        super();
    }

    getNotifications(count) {
        var url = count?'/notification/api/deliveries?limit='+count:'/notification/api/deliveries';
        return this.ajax.get(url)
            .then(res => res && res.body)
            .catch(err => this.getErrorFromResponse(err));
    }

    getNotificationCount() {
        return this.ajax.get('/notification/api/deliverycount')
            .then(res => res && res.body)
            .catch(err => this.getErrorFromResponse(err));
    }

    acknowledge(deliveryId) {
        return this.ajax.put(`/notification/api/deliveries/${deliveryId}/acknowledge`)
            .then(res => res && res.body)
            .catch(err => this.getErrorFromResponse(err));
    }
}

export default Notifications;