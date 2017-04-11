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
            id : 'scott.tiger@example.com',
            federationId : '',
            supplierId : 'hard001',
            status : 'firstLogin',
            mayChangeSupplier : false,
            mayChangeCustomer : false,
            createdBy : 'the doctor'
        },
        {
            id : 'john.doe@ncc.com',
            federationId : '',
            customerId : 'ncc',
            status : 'firstLogin',
            mayChangeSupplier : false,
            mayChangeCustomer : false,
            createdBy : 'the doctor'
        },
        {
            id : 'supplier@example.com',
            federationId : '',
            status : 'firstLogin',
            mayChangeSupplier : false,
            mayChangeCustomer : false,
            createdBy : 'the doctor'
        }        
    ];

    var profiles = [
        {
            userId : 'scott.tiger@example.com',
            email : 'scott.tiger@example.com',
            languageId : 'de',
            countryId : 'DE',
            timeZoneId : 'CET',
            salutation : 'Mr',
            firstName : 'Scott',
            lastName : 'Tiger',
            birthday : '01.02.1980',
            phoneNo : '+49123456789',
            department : 'Tiger Store',
            floor : '1st',
            room : '88',
            createdBy : 'the doctor'
        },
        {
            userId : 'john.doe@ncc.com',
            email : 'john.doe@ncc.com',
            languageId : 'de',
            countryId : 'DE',
            timeZoneId : 'CET',
            salutation : 'Mr',
            firstName : 'John',
            lastName : 'Doe',
            birthday : '02.03.1983',
            phoneNo : '+49123456789',
            department : 'Doe Management',
            floor : '3rd',
            room : '42',
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
    var userIds = [ 'scott.tiger@example.com', 'john.doe@ncc.com' ];

    return Promise.all(userIds.map(userId => db.models.User.destroy({  where : { id : userId }})));
}
