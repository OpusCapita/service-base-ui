'use strict';

const Logger = require('ocbesbn-logger'); // Logger
const db = require('ocbesbn-db-init'); // Database
const server = require('ocbesbn-web-init'); // Web server
const bouncer = require('ocbesbn-bouncer') // ACL bouncer

const logger = new Logger();
//logger.redirectConsoleOut(); // Force anyone using console outputs into Logger format.

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init
db.init({
    consul : {
        host : 'consul'
    },
    retryCount : 50
})
.then((db) => server.init({
    routes : {
        dbInstance : db
    },
    server : {
        port : process.env.PORT || 3008,
        middlewares : [ bouncer({
            host : 'consul',
            serviceName : 'user',
            acl : require('./acl.json'),
            aclServiceName : 'acl'
        }).Middleware ]
    },
    serviceClient : {
        injectIntoRequest : true,
        consul : {
            host: 'consul'
        }
    }
}))
.catch((e) =>
{
    server.end();
    throw e;
});
