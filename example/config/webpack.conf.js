const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const distPath = path.resolve(__dirname, '../dist');
const srcPath = path.resolve(__dirname, '../src');
const publicPath = path.resolve(__dirname, '../public');
const base = require('../../config/webpack.base.conf');

module.exports = merge(base, {
  mode: "development",
  entry: path.join(srcPath, 'index.js'),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PUBLIC_URL': '/',
    }),
    new HtmlWebpackPlugin({
      template: path.join(publicPath, 'index.html'),
      filename: "index.html",
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
      },
      hash: true
    }),
  ],
  devServer: {
    host: '0.0.0.0',
    contentBase: distPath,
    compress: false,
    port: 9000,
    historyApiFallback: true,
    hot: true,
    open: true,
  }
});
