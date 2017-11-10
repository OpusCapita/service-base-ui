const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './local/index-page.js',
	output: {
		path: path.resolve(__dirname, './src/server/static'),
		publicPath: '/static',
		filename: 'bundle.js'
	},

	//exclude empty dependencies, require for Joi
	node: {
		net: 'empty',
		tls: 'empty',
		dns: 'empty'
	},

	devtool: 'eval-source-map',

	plugins: [
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|de/),
		new webpack.NoEmitOnErrorsPlugin()
	],

	resolve: {
		modules: [process.env.NODE_PATH, 'node_modules'],
		extensions: ['.js']
	},

	resolveLoader: {
		modules: [process.env.NODE_PATH, 'node_modules'],
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
