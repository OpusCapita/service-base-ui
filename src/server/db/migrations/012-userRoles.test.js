'use strict';

module.exports.up = function(db, config)
{
    const roles = [
        {
            id: 'invoice-approver',
            createdBy: 'The Doctor',
            createdOn: new Date()
        },
        {
            id: 'invoice-inspector',
            createdBy: 'The Doctor',
            createdOn: new Date()
        }
    ];

    return db.queryInterface.bulkInsert('UserRole', roles);
};

module.exports.down = function(db, config)
{
    const roleIds = ['invoice-approver', 'invoice-inspector'];

    return db.queryInterface.bulkDelete('UserRole', { id : { $in : roleIds } });
};
