const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		registration: './src/client/components/SupplierRegistrationEditor/index.js',
		information: './src/client/components/SupplierEditor/index.js',
		address: './src/client/components/SupplierAddressEditor/index.js',
		contact: './src/client/components/SupplierContactEditor/index.js',
		profile_strength: './src/client/components/SupplierProfileStrength/index.js',
		bank_accounts: './src/client/components/SupplierBankAccountEditor/index.js'
	},
	output: {
		path: path.resolve(__dirname, './src/server/static'),
		publicPath: '/static',
		filename: 'components/[name]-bundle.js',
		library: 'supplier-[name]',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},

	//exclude empty dependencies, require for Joi
	node: {
		net: 'empty',
		tls: 'empty',
		dns: 'empty'
	},

	bail: true,
	// devtool: 'source-map',

	plugins: [
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|de/)
	],

	resolve: {
		extensions: ['.js']
	},

	resolveLoader: {
		extensions: ['.js']
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				loader: "style-loader!css-loader"
			},
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				include: [
					path.join(__dirname, 'src')
				],
				options: {
					presets: [
						['es2015', {modules: false}],
						'react',
						'stage-0'
					],
					plugins: ['transform-decorators-legacy']
				}
			}
		]
	}
};