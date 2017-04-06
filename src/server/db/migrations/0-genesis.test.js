'use strict'

const Sequelize = require('sequelize');
const Promise = require('bluebird');

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
    var users = [
        {
            id : 'abc:user',
            federationId : 'abc',
            supplierId : '42',
            status : 'firstLogin',
            mayChangeSupplier : true,
            mayChangeCustomer : true,
            createdBy : 'the doctor'
        }
    ];

    var profiles = [
        {
            userId : 'abc:user',
            email : 'user@domain.com',
            languageId : 'de',
            countryId : 'DE',
            timeZoneId : 'CET',
            salutation : 'Mr',
            firstName : 'Foo',
            lastName : 'Bar',
            birthday : '01.01.1971',
            phoneNo : '+49123456789',
            department : 'Foobar',
            floor : '1st',
            room : '88',
            createdBy : 'the doctor'
        }
    ];

    return Promise.all(users.map(user => db.models.User.upsert(user)))
        .then(() => Promise.all(profiles.map(user => db.models.UserProfile.upsert(user))));
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
    var userIds = [ 'abc:user' ];

    return Promise.all(userIds.map(userId => db.models.User.destroy({  where : { id : userId }})));
}
