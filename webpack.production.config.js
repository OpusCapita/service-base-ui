const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		profile: './src/client/components/UserProfileEditor/index.js',
		role: './src/client/components/UserRoleEditor/index.js',
		list: './src/client/components/UserList/index.js'
	},
	output: {
		path: path.resolve(__dirname, './src/server/static'),
		publicPath: '/static',
		filename: 'components/[name]-bundle.js',
		library: 'user-[name]',
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
		modules: [process.env.NODE_PATH, 'node_modules'],
		extensions: ['.json', '.jsx', '.js']
	},

	resolveLoader: {
		modules: [process.env.NODE_PATH, 'node_modules'],
		extensions: ['.js']
	},

	module: {
		rules: [
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.css$/,
				loader: "style-loader!css-loader"
			},
			{
				test: /\.less$/,
				loader: 'style-loader!css-loader!less-loader'
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