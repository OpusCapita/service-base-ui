'use strict'

const users = require('../data/user-16.json');

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
    users.forEach(user => user.createdOn = new Date());
    return db.queryInterface.bulkInsert('User', users).then(() =>
        db.queryInterface.bulkDelete('UserHasRole',
            {
                userId: { $in: ['andy.approver@ncc.com', 'indy.inspector@ncc.com'] }
            }
        )
    ).then(() =>
        db.queryInterface.bulkDelete('User',
            {
                id: { $in: ['andy.approver@ncc.com', 'indy.inspector@ncc.com'] }
            }
        )
    )
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
    return db.queryInterface.bulkDelete('User',
        {
            id: { $in: users.map(user => user.id) }
        }
    )
}