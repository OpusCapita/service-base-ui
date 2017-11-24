const baseConfig = require('./dev/webpack.config');
const extend = require('extend');
const webpack = require('webpack');

delete baseConfig.entry.main;
delete baseConfig.output.publicPath;

const config = {
    entry: {
        main: [ process.cwd() + '/index.react.js' ]
    },
    externals: {
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            umd: 'react'
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            umd: 'react-dom'
        },
        'react-router': {
            root: 'ReactRouter',
            commonjs2: 'react-router',
            commonjs: 'react-router',
            amd: 'react-router'
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery:"jquery"
        }),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true
            },
            comments: false
        })
    ]
}

module.exports = extend(true, { }, baseConfig, config);
