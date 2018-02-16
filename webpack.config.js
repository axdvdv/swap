const path                  = require('path')
const webpack               = require('webpack')
const HtmlWebpackPlugin     = require('html-webpack-plugin')


const IS_DEV      = process.env.NODE_ENV === 'development'
const SRC_DIR     = path.join(__dirname, 'src')
const BUILD_DIR   = path.join(__dirname, 'build')


/**
 * Webpack Configuration
 */
module.exports = {

  devtool: IS_DEV ? 'eval' : 'cheap-module-source-map',

  devServer: {
    historyApiFallback: true,
  },

  entry: {
    'app': path.resolve(__dirname, 'src/index.js'),
  },

  output: IS_DEV ? {
    pathinfo: true,
    publicPath: '/',
    filename: '[name].js'
  } : {
    path: BUILD_DIR,
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/',
  },

  resolve: {
    modules: [
      'node_modules',
      SRC_DIR,
    ]
  },
  
  module: {
    rules: [

      // BABEL
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          compact: true,
        },
      },

      // STYLES
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: IS_DEV,
            },
          },
        ],
      },

      // CSS / SASS
      {
        test: /\.scss/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: IS_DEV,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: IS_DEV,
              includePaths: [ SRC_DIR ],
            },
          },
        ],
      },

      // IMAGES
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },

    ]
  },

  plugins: [

    new webpack.DefinePlugin({
      IS_DEV,
    }),

    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      title: 'Swap',
      hash: false,
    }),

  ]
    .concat(IS_DEV ? [] : [

      // ...

    ]),
}
