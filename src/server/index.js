'use strict';

const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database
const bouncer = require('ocbesbn-bouncer') // ACL bouncer

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init
db.init({
    consul: {
        host: 'consul'
    },
    retryCount: 50
})
.then((db) => server.init({
    routes: {
        dbInstance: db
    },
    server : {
        port : process.env.PORT || 3008,
        staticFilePath: __dirname + '/static',
        middlewares: [ require("express-ejs-layouts"), bouncer({
          host: 'consul',
          serviceName: 'user',
          acl: require('./acl.json'),
          aclServiceName: 'acl'
        }).Middleware]
    },
    serviceClient : {
        injectIntoRequest : true,
        consul : {
            host : 'consul'
        }
    }
}))
.then((app) => {
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');
})
.catch((e) => {
    server.end();
    throw e;
});
