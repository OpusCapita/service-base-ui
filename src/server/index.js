'use strict';

const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init
db.init({ mode : db.Mode.Dev, consul : { host : 'consul' }, data : { addTestData : true } })
    .then((db) => server.init({ mode : server.Server.Mode.Dev, routes : { dbInstance : db } }))
    .catch((e) => { server.end(); throw e; });
