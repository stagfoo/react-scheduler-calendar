const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const path = require('path');
const distPath = path.resolve(__dirname, '../dist');
const srcPath = path.resolve(__dirname, '../src');
const base = require('./webpack.base.conf');

module.exports = merge(base, {
  mode: "production",
  entry: path.join(srcPath, 'index.tsx'),
  output: {
    library: 'react-scheduler-calendar',
    libraryTarget: 'commonjs2',
    path: distPath,
    filename: 'index.js'
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'moment': 'moment',
  },
  plugins: [
    new BundleAnalyzerPlugin(),
  ],
  optimization: {
    minimize: true,
  }
});
