'use strict';

const Logger = require('ocbesbn-logger'); // Logger
const server = require('ocbesbn-web-init'); // Web server

const logger = new Logger();

server.init({
    server: {
        mode: server.Server.Mode.Dev,
        port: 3300,
        staticFilePath : process.cwd() + '/dev/static',
        indexFilePath: process.cwd() + '/dev/index.html',
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
.catch((e) => {
    server.end();
    throw e;
});
