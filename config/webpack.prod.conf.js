const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
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
    'react-dnd': 'react-dnd',
    'react-dnd-html5-backend': 'react-dnd-html5-backend',
    'moment': 'moment',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: true,
          keep_classnames: true,
        },
      }),
    ],
  }
});
