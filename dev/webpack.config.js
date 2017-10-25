const webpack = require('webpack');

module.exports = {
    entry: {
        main: [ 'babel-polyfill', process.cwd() + '/dev/index.react.js' ]
    },
    output: {
        filename: 'bundle.js',
        publicPath: '/static',
        path: process.cwd() + '/lib',
        library: 'service-base-ui',
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery:"jquery"
        })
    ],
    module: {
        rules: [
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpg|svg|eot|svg|ttf|woff|woff2)$/,
                loader: 'url-loader?limit=819200'
            },
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    compact: false,
                    babelrc: false,
                    presets: [
                        ['env', { 'targets': { 'node': 8, 'uglify': true }, 'modules': false }],
                        'stage-0',
                        'react'
                    ]
                }
            }
        ]
    }
}
