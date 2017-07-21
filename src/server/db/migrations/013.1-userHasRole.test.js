'use strict';

const Promise = require('bluebird');

const assignedRoles = [
    {
        userId: 'andy.approver@ncc.com',
        roleId: 'user',
        createdBy: 'The Doctor',
        createdOn : new Date()
    },
    {
        userId: 'indy.inspector@ncc.com',
        roleId: 'user',
        createdBy: 'The Doctor',
        createdOn : new Date()
    }
];

module.exports.up = function(db, config)
{
    return db.queryInterface.bulkInsert('UserHasRole', assignedRoles);
};

module.exports.down = function(db, config)
{
    return Promise.all(
        assignedRoles.map(assignedRole => {
            return db.queryInterface.bulkDelete('UserHasRole', {
                userId : assignedRole.userId,
                roleId: assignedRole.roleId
            })
        })
    );
};
