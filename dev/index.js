'use strict';

const Logger = require('ocbesbn-logger'); // Logger
const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init');

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
.then(() =>
{
    return db.init({
        retryCount : 50,
        consul : {
            host : 'consul'
        },
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
