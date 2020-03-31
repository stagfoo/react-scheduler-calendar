const path = require('path');
const root = path.resolve(__dirname);
const distPath = path.join(__dirname, 'dist');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    path: distPath,
    filename: '[name].bundle.js'
  },
  entry: './src/App.tsx',
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
    ],
  },
  resolve: {
    modules: ['node_modules', root],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.es6'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
      },
      hash: true
    }),
  ],
  devServer: {
    contentBase: distPath,
    compress: true,
    port: 9000,
    historyApiFallback: true,
    hot: true,
    open: true,
  }
};
