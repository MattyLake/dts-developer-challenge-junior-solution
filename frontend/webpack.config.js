const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    // Extracts CSS into a separate file
                    MiniCssExtractPlugin.loader,
                    // Interprets @import and url() in CSS
                    'css-loader',
                    // Processes CSS with plugins like Tailwind and Autoprefixer
                    'postcss-loader',
                ],
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles.css',
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            // favicon: './public/favicon.ico',
            filename: 'index.html',
        }),
    ],
    devServer: {
        static: {
            directory: __dirname + '/dist',
        },
        compress: true,
        port: 9000,
        hot: true,
        open: true,
        historyApiFallback: true,
    },
    
    // Development Configuration
    // mode: 'development',
    // devtool: 'source-map',

    // Production Configuration
    mode: 'production',
};