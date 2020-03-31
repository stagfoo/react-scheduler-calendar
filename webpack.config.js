const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const root = path.resolve(__dirname);
module.exports = {
  mode: "production",
  output: {
    library: 'react-scheduler-calendar',
    libraryTarget: 'commonjs2',
    path: __dirname + '/dist',
    filename: 'index.js'
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'moment': 'moment',
  },
  entry: './src/index.tsx',
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
    modules: ['node_modules', root],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.es6'],
  },
  plugins: [
    new BundleAnalyzerPlugin(),
  ],
  optimization: {
    // minimize: true,
  }
};
