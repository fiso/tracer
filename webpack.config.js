const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const version = require('./package.json').version;

console.log(`${version} ===================`);
console.log(`${process.env.NODE_ENV} build started`);
console.log('=========================');

String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement);
};

const production = process.env.NODE_ENV === 'production';
const vstr = version.replaceAll('.', '-');

const extractSass = new ExtractTextPlugin({
  filename: production ? `css/akm-[name]-${vstr}.css` :
                         'css/akm-[name]-[hash].css',
  // This actually makes the fallback style-loader active during development
  disable: !production,
});

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src/js/index'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: production ? `js/akm-[name]-${vstr}.bundle.js` :
                           'js/akm-[name]-[hash].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
        query: {
          presets: [
            ['env', {
              // Use ECMAScript Module syntax when possible
              modules: false,
              // Don't polyfill unless target platform requires it
              useBuiltIns: true,
            }],
          ],
        },
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{
            loader: 'css-loader',
          }, {
            loader: 'sass-loader',
            options: {
              outputStyle: production ? 'compressed' : 'nested',
            },
          }],
          fallback: 'style-loader',
        }),
      },
    ],
  },
  plugins: [
    // This injects the process.env.NODE_ENV variable into the bundle,
    // so frontend config can know what environment it is in
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
    extractSass,
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/html/index.html',
    }),
    new CopyWebpackPlugin([{
      from: 'src/assets',
    }]),
  ]
  .concat(production ? [
    // https://webpack.js.org/plugins/module-concatenation-plugin/
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    }),
    new webpack.HashedModuleIdsPlugin(),
  ] : []),
  stats: {
    colors: true,
  },
  devtool: production ? 'cheap-module-source-map' : 'source-map',
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};
// ✌️
