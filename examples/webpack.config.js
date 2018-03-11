const readFileSync = require('fs').readFileSync;
const webpack = require('webpack');
// note that for tree shaking to work, we also need three things:
// 1. use es6 modules always (commonjs modules don't work)
// 2. use the uglifyjs webpack plugin
// 3. use the es2015 babel preset with the "modules:false" option
// more info: https://medium.com/modus-create-front-end-development/webpack-2-tree-shaking-configuration-9f1de90f3233
// note that the plugin described in that article is slightly out of date and webpack recommends the syntax used in the babel-loader options

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    index: ['babel-polyfill', './src/index.js']
  },
  resolve: {
    extensions: ['.js']
  },
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    chunkFilename: '[name].[id].js'
  },
  plugins: [new UglifyJSPlugin()],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'env',
                {
                  modules: false
                }
              ]
            ]
          }
        }
      }
    ]
  },
  devtool: 'inline-source-map'
};
