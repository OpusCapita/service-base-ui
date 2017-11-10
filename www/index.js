'use strict';

const db = require('ocbesbn-db-init');
const server = require('ocbesbn-web-init');

const mockUserData = {
	id: 'john.doe@ncc.com'
};

const mockUserDataMiddleware = (req, res, next) => {
	req.opuscapita.userData = key => mockUserData[key];
	next();
};

db.init({ consul : { host : 'consul' }, retryCount: 50 })
	.then(db => server.init({
		routes : { dbInstance : db },
		server: {
			staticFilePath: __dirname + '/../src/server/static',
			indexFilePath: __dirname + '/index.html',
			port : process.env.PORT || 3001,
			webpack: {
				useWebpack: true,
				configFilePath: __dirname + '/../webpack.development.config.js'
			},
			middlewares: [mockUserDataMiddleware]
		},
		serviceClient : {
			injectIntoRequest : true,
			consul : {
				host : 'consul'
			}
		}
	}));
