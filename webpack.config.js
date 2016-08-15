const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const parts = require('./libs/webpack.parts');
const pkg = require('./package.json');
const standardConfig = require('stylelint-config-standard');

const PATHS = {
  build: path.join(__dirname, 'build'),
  modules: path.join(__dirname, 'node_modules'),
  src: path.join(__dirname, 'src'),
  style: path.join(__dirname, 'src', 'style', 'index.css')
};

const common = merge(
  {
    entry: {
      app: PATHS.src,
      style: PATHS.style
    },
    output: {
      path: PATHS.build,
      filename: '[name].js'
    },
    module: {
      preLoaders: [
        {
          test: /\.js?$/,
          loaders: ['eslint'],
          include: PATHS.app
        },
        {
          test: /\.css$/,
          loaders: ['postcss'],
          include: PATHS.app
        }
      ]
    },
    postcss: function () {
      return [
        require('stylelint')(standardConfig),
        require('postcss-cssnext')(),
      ];
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/templates/index.html'
      })
    ]
  },
  parts.loadJavascript({
    include: PATHS.app,
    exclude: PATHS.modules
  })
);

var config;

// Run the config based on the npm process
switch(process.env.npm_lifecycle_event) {

  case 'build':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure
          chunkFilename: '[chunkhash].js'
        }
      },
      parts.setFreeVariable(
       'process.env.NODE_ENV',
       'production'
      ),
      parts.clean(PATHS.build),
      // we make a separate bundle for or our vendor dependencies
      // this gets them automatically from package.json
      // Uncomment next 4 lines to make it work
      parts.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
      }),
      parts.minify(),
      parts.extractCSS(PATHS.style)
    );
    break;

  default:
    config = merge(
      common,
      { devtool: 'inline-source-map' },
      parts.setupCSS(PATHS.style),
      parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT
      }),
      { devtool: 'eval-source-map' }
    );
}

module.exports = validate(config);
