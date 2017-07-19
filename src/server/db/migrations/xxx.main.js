'use strict'

const fs = require('fs');

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
    const cwd = process.cwd();
    const path = cwd + '/src/server/db/migrations';
    this.serviceName = cwd.slice(cwd.lastIndexOf('/') + 1);

    this.oldNames = [ ];
    this.newNames = [ ];
    this.oldPaths = [ ];
    this.newPaths = [ ];
    this.renamed = [ ];

    return db.query('SELECT * FROM `'+ this.serviceName +'-migrations`').spread(migrations =>
    {
        let regexp = /(\d+)(.*)/

        migrations.forEach(migration =>
        {
            const matches = migration.name.match(regexp);
            const number = matches[1];

            const oldPath = path + '/' + migration.name;
            const newPath = path + '/' + ('000' + number).slice(-3) + matches[2];

            this.oldNames.push(migration.name);
            this.newNames.push(('000' + number).slice(-3) + matches[2]);
            this.oldPaths.push(oldPath);
            this.newPaths.push(newPath);
        });

        this.renamed = this.oldPaths.map((oldPath, i) => fs.renameSync(oldPath, this.newPaths[i]) && i);

        return Promise.all(this.oldNames.map((oldName, i) =>
        {
            return db.query('UPDATE `'+ this.serviceName +'-migrations` SET name = ? WHERE name = ?', {
                replacements : [ this.newNames[i], oldName ]
            });
        }))
        .then(() => db.query('ALTER TABLE `'+ this.serviceName +'-migrations` ORDER BY name ASC'));
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
    this.renamed.forEach(i => fs.renameSync(this.newPaths[i], this.oldPaths[i]));
    const all = this.renamed.map(i =>
    {
        return db.query('UPDATE `'+ this.serviceName +'-migrations` SET name = ? WHERE name = ?', {
            replacements : [ this.oldName[i], this.newNames[i] ]
        });
    });

    return Promise.all(all);
}
