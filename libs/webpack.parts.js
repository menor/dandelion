const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

// -----------------------------------------------------------------------------
// Dev Server
// -----------------------------------------------------------------------------
exports.devServer = function (options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,
      hot: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      host: options.host, // Defaults to `localhost`
      port: options.port // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  }
}

// -----------------------------------------------------------------------------
// CSS
// -----------------------------------------------------------------------------
exports.setupCSS = function (paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css?modules'],
          include: paths
        }
      ]
    }
  }
}

// -----------------------------------------------------------------------------
// Minify
// -----------------------------------------------------------------------------
exports.minify = function () {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  }
}

// -----------------------------------------------------------------------------
// Environment variables
// -----------------------------------------------------------------------------
// This allows us to force set environment variables, some libraries like react
// check this variable to determine the build.
exports.setFreeVariable = function (key, value) {
  const env = {}
  env[key] = JSON.stringify(value)

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  }
}

// -----------------------------------------------------------------------------
// Clean build task
// -----------------------------------------------------------------------------
exports.clean = function (path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd()
      })
    ]
  }
}

// -----------------------------------------------------------------------------
// Babel task
// -----------------------------------------------------------------------------
exports.loadJavascript = function (options) {
  return {
    module: {
      loaders: [
        {
          test: /\.js$/,
          // Enable caching for extra performance
          loaders: ['babel?cacheDirectory'],
          include: options.include,
          exclude: options.exclude
        }
      ]
    }
  }
}

// -----------------------------------------------------------------------------
// Extract vendor libraries
// -----------------------------------------------------------------------------
// This gets the vendor dependencies out of the app bundles, since we are
// still requiring the libraries, webpack will include them in the bundles,
// here we are taking them out from our app bundles.
exports.extractBundle = function (options) {
  const entry = {}
  entry[options.name] = options.entries

  return {
    // Define an entry point needed for splitting.
    entry: entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest'],

        // options.name modules only
        minChunks: Infinity
      })
    ]
  }
}

// -----------------------------------------------------------------------------
// Extract CSS
// -----------------------------------------------------------------------------
exports.extractCSS = function (paths) {
  return {
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: paths
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  }
}
