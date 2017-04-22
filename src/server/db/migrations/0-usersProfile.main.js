'use strict'

const Sequelize = require('sequelize');
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
  const queryInterface = db.getQueryInterface();

  return Promise.all([
    queryInterface.createTable('UserProfile', {
          /** Unique identifier usually concatenated of federation id ':' and user id to ensure unique user names. */
          userId : {
              type : Sequelize.STRING(100),
              allowNull : false,
              primaryKey : true
          },
          /** A user's email address. */
          email : {
              type : Sequelize.STRING(100),
              allowNull : false
          },
          /** A user's language preference in as in ISO 639-1/2 */
          languageId : {
              type : Sequelize.STRING(3),
              allowNull : false,
              defaultValue : 'en'
          },
          /** A user's country preference in as in ISO 3166-1 alpha2 */
          countryId : {
              type : Sequelize.STRING(2),
              allowNull : false,
              defaultValue : 'EU'
          },
          /** Identifier of a user's time zone. */
          timeZoneId : {
              type : Sequelize.STRING(50),
              allowNull : false,
              defaultValue : 'CET'
          },
          salutation : {
              type : Sequelize.STRING(20),
              allowNull : false
          },
          firstName : {
              type : Sequelize.STRING(50),
              allowNull : false
          },
          lastName : {
              type : Sequelize.STRING(50),
              allowNull : false
          },
          birthday : {
              type : Sequelize.DATE(),
              allowNull : true
          },
          degree : {
              type : Sequelize.STRING(20),
              allowNull : false,
              defaultValue : ''
          },
          phoneNo : {
              type : Sequelize.STRING(20),
              allowNull : false,
              defaultValue : ''
          },
          faxNo : {
              type : Sequelize.STRING(100),
              allowNull : false,
              defaultValue : ''
          },
          department : {
              type : Sequelize.STRING(40),
              allowNull : false,
              defaultValue : ''
          },
          building : {
              type : Sequelize.STRING(40),
              allowNull : false,
              defaultValue : ''
          },
          floor : {
              type : Sequelize.STRING(40),
              allowNull : false,
              defaultValue : ''
          },
          room : {
              type : Sequelize.STRING(40),
              allowNull : false,
              defaultValue : ''
          },
          createdBy : {
              type : Sequelize.STRING(60),
              allowNull : false
          },
          changedBy : {
              type : Sequelize.STRING(60),
              allowNull : false,
              defaultValue : ''
          },
          createdOn : {
              type : Sequelize.DATE(),
              allowNull : false,
              defaultValue : Sequelize.NOW
          },
          changedOn : {
              type : Sequelize.DATE(),
              allowNull : true
          }
    })
  ]);
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
    var modelNames = [ 'UserProfile' ];
    var qi = db.getQueryInterface();

    return Promise.all(modelNames.map(key => qi.dropTable(db.models[key].getTableName())));
}
