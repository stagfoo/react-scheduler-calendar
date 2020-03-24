const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: "development",
  output: {
    library: 'react-scheduler-calendar',
    libraryTarget: 'commonjs2',
    path: __dirname + '/dist',
    filename: 'index.js'
  },
  externals: {
    'antd': 'antd',
    'react': 'react',
    'moment': 'moment',
    'react-dom': 'react-dom',
    "react-dnd": "react-dnd",
    "react-dnd-html5-backend": "react-dnd-html5-backend",
    "rrule": "rrule",
  },
  entry: './src/index.tsx',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            outDir: './dist'
          }
        },
      },
      {
        test: /\.jsx$|\.es6$|\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      { test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader' },
      { test: /\.json/i, type: 'javascript/auto', loader: 'json-loader' }
    ],
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname)],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.es6'],
  },
  optimization: {
    minimize: false,
  }
};
