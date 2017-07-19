'use strict';

module.exports.up = function(db, config)
{
    const profiles = [
        {
            userId : 'andy.approver@ncc.com',
            email : 'andy.approver@ncc.com',
            salutation : 'Mr',
            firstName : 'Andy',
            lastName : 'Approver',
            createdBy : 'The Doctor',
            createdOn : new Date()
        },
        {
            userId : 'indy.inspector@ncc.com',
            email : 'indy.inspector@ncc.com',
            salutation : 'Mr',
            firstName : 'Indy',
            lastName : 'Inspector',
            createdBy : 'The Doctor',
            createdOn : new Date()
        }
    ];

    return db.queryInterface.bulkInsert('UserProfile', profiles);
};

module.exports.down = function(db, config)
{
    const userIds = ['andy.approver@ncc.com', 'indy.inspector@ncc.com'];

    return db.queryInterface.bulkDelete('UserProfile', { userId : { $in : userIds } });
};
