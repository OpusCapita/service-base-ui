'use strict'

const Promise = require('bluebird');

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.create = function(data)
{
    return this.db.models.UserOnboardData.create(data);
}
