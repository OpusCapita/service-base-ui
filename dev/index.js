'use strict';

const Logger = require('ocbesbn-logger'); // Logger
const server = require('@opuscapita/web-init'); // Web server
const db = require('@opuscapita/db-init');
const configService = require('@opuscapita/config');

const logger = new Logger();

server.init({
    server: {
        mode: server.Server.Mode.Dev,
        port: 3300,
        staticFilePath : process.cwd() + '/dev/static',
        indexFilePath: process.cwd() + '/dev/index.html',
        enableBouncer: false,
        events : {
            onStart : () => logger.info('Server ready. Allons-y!')
        },
        webpack: {
            useWebpack : true,
            configFilePath : process.cwd() + '/dev/webpack.config.js'
        },
        cacheControl: {
            nonCachableEndpoints: [ '.*' ]
        }
    },
    routes: {
        addRoutes: false
    }
})
.then(app => app.get('*', (req, res) => res.sendFile(process.cwd() + '/dev/index.html')))
.then(() => configService.init())
.then(config => config.waitForEndpoints([ 'acl', 'user', 'auth' ]))
.then(() =>
{
    return db.init({
        data : {
            registerModels : false,
            addTestData : true,
            runDataMigration : true,
            migrationDataPath : process.cwd() + '/dev/migrations'
        }
    });
})
.catch((e) => {
    server.end();
    throw e;
});
