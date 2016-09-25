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
        new BowerWebpackPlugin({
            //excludes: /.*\.less/
        })
    ],
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'babel',
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.less$/,
                loader: 'style!css!less',
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.css$/,
                loader: 'style!css'
            },
            {
                test: /\.(woff|svg|ttf|eot)([\?]?.*)$/, 
                loader: "file-loader?name=[name].[ext]"
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
