'use strict'

const Promise = require('bluebird');
const pathjs = require('path');

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
    var userData = require('../data/service-3.json');

    userData = userData.map((data) => {
        data.createdOn = new Date();
        data.changedOn = new Date();
        return data;
    });

    return db.queryInterface.bulkInsert('User', userData);
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
    const ids = require('../data/service-3.json').map(item => item.id);

    return db.queryInterface.bulkDelete('User', {
        id : {
            $in : ids
        }
    });
}