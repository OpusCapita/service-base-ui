'use strict'

/**
 * Inserts test data into existing database structures.
 * If all migrations were successul, this method will never be executed again.
 * To identify which migrations have successfully been processed, a migration's filename is used.
 *
 * @param {object} data - [Sequelize]{@link https://github.com/sequelize/sequelize} instance.
 * @param {object} config - A model property for database models and everything from [config.data]{@link https://github.com/OpusCapitaBusinessNetwork/db-init} passed when running the db-initialization.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html}
 * @see [Applying data migrations]{@link https://github.com/OpusCapitaBusinessNetwork/db-init#applying-data-migrations}
 */
module.exports.up = function(db, config)
{
    var r1 = {
        userId : 'svc_einvoice-send',
        roleId : 'user',
        createdBy : 'The Doctor',
        createdOn : new Date()
    };

    var r2 = {
        userId : 'svc_einvoice-send',
        roleId : 'svc_einvoice-send',
        createdBy : 'The Doctor',
        createdOn : new Date()
    };

    return db.queryInterface.bulkInsert('UserHasRole', [ r1, r2 ]);
}

/**
 * Reverts all migrations for databse tables and data.
 * If the migration process throws an error, this method is called in order to revert all changes made by the up() method.
 *
 * @param {object} data - [Sequelize]{@link https://github.com/sequelize/sequelize} instance.
 * @param {object} config - A model property for database models and everything from [config.data]{@link https://github.com/OpusCapitaBusinessNetwork/db-init} passed when running the db-initialization.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html}
 * @see [Applying data migrations]{@link https://github.com/OpusCapitaBusinessNetwork/db-init#applying-data-migrations}
 */
module.exports.down = function(db, config)
{
    var d1 = db.queryInterface.bulkDelete('UserHasRole', {
        userId : 'svc_einvoice-send',
        roleId : 'user'
    });

    var d2 = db.queryInterface.bulkDelete('UserHasRole', {
        userId : 'svc_einvoice-send',
        roleId : 'svc_einvoice-send'
    });

    return Promise.all([ d1, d2 ]);
}
