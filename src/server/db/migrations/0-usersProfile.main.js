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
    return db.queryInterface.createTable('UserProfile', {
        userId: {
            type: DataTypes.STRING(100),
            allowNull: false,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        languageId: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'en'
        },
        countryId: {
            type: DataTypes.STRING(2),
            allowNull: false,
            defaultValue: 'EU'
        },
        timeZoneId: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'CET'
        },
        salutation: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        birthday: {
            type: DataTypes.DATE(),
            allowNull: true
        },
        degree: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: ''
        },
        phoneNo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: ''
        },
        faxNo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: ''
        },
        department: {
            type: DataTypes.STRING(40),
            allowNull: false,
            defaultValue: ''
        },
        building: {
            type: DataTypes.STRING(40),
            allowNull: false,
            defaultValue: ''
        },
        floor: {
            type: DataTypes.STRING(40),
            allowNull: false,
            defaultValue: ''
        },
        room: {
            type: DataTypes.STRING(40),
            allowNull: false,
            defaultValue: ''
        },
        createdBy: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        changedBy: {
            type: DataTypes.STRING(60),
            allowNull: false,
            defaultValue: ''
        },
        createdOn: {
            type: DataTypes.DATE(),
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        changedOn: {
            type: DataTypes.DATE(),
            allowNull: true
        }
    });
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
    return db.queryInterface.dropTable('UserProfile');
}
