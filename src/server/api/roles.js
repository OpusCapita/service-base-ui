'use strict'

const Promise = require('bluebird');

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.addRoles = function(roles)
{
    roles = [].concat(roles);
    roles = roles.map(role => ({id: role.id, createdBy: role.createdBy}));

    return this.db.models.UserRole.bulkCreate(roles);
}
