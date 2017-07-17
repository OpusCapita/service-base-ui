'use strict';

module.exports.up = function(db, config)
{
    const users = [
        {
            id : 'andy.approver@ncc.com',
            federationId : '',
            customerId : 'ncc',
            status : 'firstLogin',
            mayChangeSupplier : false,
            mayChangeCustomer : false,
            createdBy : 'The Doctor'
        },
        {
            id : 'indy.inspector@ncc.com',
            federationId : '',
            customerId : 'ncc',
            status : 'firstLogin',
            mayChangeSupplier : false,
            mayChangeCustomer : false,
            createdBy : 'The Doctor'
        }
    ];

    return db.queryInterface.bulkInsert('User', users);
};

module.exports.down = function(db, config)
{
    const userIds = ['andy.approver@ncc.com', 'indy.inspector@ncc.com'];

    return db.queryInterface.bulkDelete('User', { id : { $in : userIds } });
};
