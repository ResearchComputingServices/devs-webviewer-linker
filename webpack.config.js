const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const config = require('config');

module.exports = {
    mode: ( process.env.NODE_ENV ? process.env.NODE_ENV : 'development' ),

    entry: './src/index.js',

    output: {
        library: 'DEVSWebviewerLinker',
        libraryTarget: 'umd',
        globalObject: '(typeof self !== "undefined" ? self : this)',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        publicPath: config.get('publicPath')
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', {
                        'plugins': ['@babel/plugin-proposal-class-properties']
                    }]
                }
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
            }
        ]
    },

    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'index.html')
        })
    ],

    devServer: {
        historyApiFallback: true,
        open: config.get('open')
    },

    devtool: ( 'production' === process.env.NODE_ENV ? 'source-map' : 'cheap-module-eval-source-map' ),
};
