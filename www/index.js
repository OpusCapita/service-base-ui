'use strict';

const db = require('ocbesbn-db-init');
const server = require('ocbesbn-web-init');

db.init({ consul : { host : 'consul' } })
	.then(db => server.init({
		routes : { dbInstance : db },
		server: {
			staticFilePath: __dirname + '/../src/server/static',
			indexFilePath: __dirname + '/index.html',
			port : process.env.PORT || 3001,
			webpack: {
				useWebpack: true,
				configFilePath: __dirname + '/../webpack.development.config.js'
			}
		},
		serviceClient : {
			injectIntoRequest : true,
			consul : {
				host : 'consul'
			}
		}
	}));
