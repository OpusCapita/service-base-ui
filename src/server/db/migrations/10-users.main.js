'use strict'

const DataTypes = require('sequelize');
const Promise = require('bluebird');

/**
 * Applies migrations for databse tables and data.
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
    var c1 = db.queryInterface.changeColumn('UserProfile', 'email', {
        type : DataTypes.STRING(100),
        allowNull : true
    });

    var c2 = db.queryInterface.changeColumn('UserProfile', 'salutation', {
        type : DataTypes.STRING(20),
        allowNull : false,
        defaultValue : ''
     });

     var c3 = db.queryInterface.changeColumn('UserProfile', 'firstName', {
         type : DataTypes.STRING(50),
         allowNull : false,
         defaultValue : ''
     });

     var c4 = db.queryInterface.changeColumn('UserProfile', 'lastName', {
         type : DataTypes.STRING(50),
         allowNull : false,
         defaultValue : ''
     });

     return Promise.all([ c1, c2, c3, c4 ]);
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
    var c1 = db.queryInterface.changeColumn('UserProfile', 'email', {
        type : DataTypes.STRING(100),
        allowNull : false
    });

    var c2 = db.queryInterface.changeColumn('UserProfile', 'salutation', {
        type : DataTypes.STRING(20),
        allowNull : false
     });

     var c3 = db.queryInterface.changeColumn('UserProfile', 'firstName', {
         type : DataTypes.STRING(50),
         allowNull : false
     });

     var c4 = db.queryInterface.changeColumn('UserProfile', 'lastName', {
         type : DataTypes.STRING(50),
         allowNull : false
     });

     return Promise.all([ c1, c2, c3, c4 ]);
}
