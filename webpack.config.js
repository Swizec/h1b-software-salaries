var path = require('path');
var webpack = require('webpack');
var BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        './src/main.jsx'
    ],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'build'),
        publicPath: '/build/'
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new BowerWebpackPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loaders: ['babel'],
                include: path.join(__dirname, 'src')
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
