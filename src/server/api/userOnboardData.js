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

module.exports.find = function(id)
{
    return this.db.models.UserOnboardData.findById(id);
}
