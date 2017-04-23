// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
var path = require('path');
var copyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
  devtool: '#eval-source-map',

  entry: [
  './public/js/main'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'js/bundle.js'
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
     debug: true
    }),
    new copyWebpackPlugin([

      {
        from: 'public',
        to : './'
      }

    ]),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new WebpackShellPlugin({
      onBuildStart: ['echo "Starting"'],
      onBuildExit: ['cd dist/vendor/gifloopcoder && npm i && grunt build'],
      safe: true
    })
  ],

  module: {
    loaders: [
    { test: /\.css$/, loaders: ['style', 'css', 'postcss'] },
    { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass'] },
    {
      loader: "babel-loader",

        // Only run `.js` and `.jsx` files through Babel
        test: /\.jsx?$/,

        exclude: /node_modules/,

        // Options to configure babel with
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0'],
        }
      },
      ]
    }
  };
