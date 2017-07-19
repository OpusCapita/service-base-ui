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
    var ocAdmin = {
        userId : 'ocadmin',
        roleId : 'admin',
        createdBy : 'The Doctor',
        createdOn : new Date()
    };

    var svcSupplier = {
        userId : 'svc_supplier',
        roleId : 'svc_supplier',
        createdBy : 'The Doctor',
        createdOn : new Date()
    };

    this.oldEntries = db.models.UserHasRole.findAll();

    return this.oldEntries.then(() =>
    {
        return Promise.all([
            db.queryInterface.bulkDelete('UserHasRole', { roleId : { '$in' : [ 'xtenant', 'user' ] } }),
            db.queryInterface.bulkDelete('UserHasRole', { userId : 'scott.tiger@example.com', roleId : 'admin' })
        ]);
    })
    .then(() =>
    {
        return db.models.User.findAll().map(user => user.dataValues).map(user =>
        {
            return {
                userId : user.id,
                roleId : 'user',
                createdBy : 'The Doctor',
                createdOn : new Date()
            };
        })
    })
    .then(allForUser => db.queryInterface.bulkInsert('UserHasRole', allForUser))
    .then(allForUser => db.queryInterface.bulkInsert('UserHasRole', [ ocAdmin, svcSupplier ]));
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
    return this.oldEntries.map(e => e.dataValues).filter(e => e.roleId === 'xtenant' || e.roleId === 'user')
        .then(allForUser => db.queryInterface.bulkInsert('UserHasRole', allForUser));
}
