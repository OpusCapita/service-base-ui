'use strict'

const Promise = require('bluebird');
const Sequelize = require('sequelize');

/**
 * Initializes all required database models using Sequelize.
 *
 * @param {object} db - [Sequelize]{@link https://github.com/sequelize/sequelize} instance.
 * @param {object} config - Everything from [config.data]{@link https://github.com/OpusCapitaBusinessNetwork/db-init} passed when running the db-initialization.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html}
 * @see [Creating database models]{@link https://github.com/OpusCapitaBusinessNetwork/db-init#creating-database-models}
 */
module.exports.init = function(db, config)
{
    // Register Sequelize database models here.
    // Use require in order to separate models into multiple js files.
    // http://docs.sequelizejs.com/en/latest/api/model/
    //
    // db.define(...);

    // Always return a promise.
    return Promise.resolve();
}
