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
    queryInterface.createTable('User', {
      /** Unique identifier usually concatenated of federation id ':' and user id to ensure unique user names. */
      id : {
          type : Sequelize.STRING(100),
          allowNull : false,
          primaryKey : true
      },
      /**  Id of the federation owning a user identity. */
      federationId : {
          type : Sequelize.STRING(50),
          allowNull : false,
          defaultValue : ''
      },
      /** Identifier of supplier a user is assigned to. */
      supplierId : {
          type : Sequelize.STRING(30),
          allowNull : true
      },
      /** Identifier of customer a user is assigned to. */
      customerId : {
          type : Sequelize.STRING(30),
          allowNull : true
      },
      /**  Representing the current lifecycle status of a user. */
      status : {
          type : Sequelize.STRING(100),
          allowNull : false
      },
      /** Whenever to enable cross tenant access. */
      mayChangeSupplier : {
          type : Sequelize.BOOLEAN(),
          allowNull : false,
          defaultValue : false
      },
      /** Whenever to enable cross tenant access. */
      mayChangeCustomer : {
          type : Sequelize.BOOLEAN(),
          allowNull : false,
          defaultValue : false
      },
      createdBy : {
          type : Sequelize.STRING(60),
          allowNull : false,
          defaultValue: 'Opuscapita user'
      },
      changedBy : {
          type : Sequelize.STRING(60),
          allowNull : false,
          defaultValue : 'Opuscapita user'
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
    var modelNames = [ 'User' ];
    var qi = db.getQueryInterface();

    return Promise.all(modelNames.map(key => qi.dropTable(db.models[key].getTableName())));
}
