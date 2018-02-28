'use strict';
const {ApiBase} = require('./ApiBase');


class NotificationApi extends ApiBase {
    constructor() {
        super();
    }

    getNotifications(count) {
        return this.ajax.get('/notification/api/deliveries')
            .then(res => {
                if(res && res.body){
                    return count?res.body.slice(0,count):res.body;
                }
                return [];
            })
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

export default NotificationApi;