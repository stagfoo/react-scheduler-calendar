const merge = require('webpack-merge');

const path = require('path');
const distPath = path.resolve(__dirname, '../dist');
const srcPath = path.resolve(__dirname, '../src');
const base = require('./webpack.base.conf');

module.exports = merge(base, {
  mode: "production",
  entry: {
    'index': path.join(srcPath, 'index.tsx'),
    'example': path.join(srcPath, 'example.tsx'),
  },
  output: {
    library: 'react-scheduler-calendar',
    libraryTarget: 'commonjs2',
    path: distPath,
    filename: '[name].js'
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'moment': 'moment',
  },
  optimization: {
    minimize: true,
  }
});
