const path                  = require('path')
const webpack               = require('webpack')
const HtmlWebpackPlugin     = require('html-webpack-plugin')
const ProgressBarPlugin     = require('progress-bar-webpack-plugin')
const ExtractTextPlugin     = require('extract-text-webpack-plugin')
const UglifyJsPlugin        = require('uglifyjs-webpack-plugin')
const CompressionPlugin     = require('compression-webpack-plugin')


const IS_DEV      = process.env.NODE_ENV === 'development'
const SRC_DIR     = path.join(__dirname, 'src')
const BUILD_DIR   = path.join(__dirname, 'build')


/**
 * Webpack Configuration
 */
module.exports = {

  devtool: IS_DEV ? 'source-map' : false,

  devServer: {
    publicPath: '/',
    stats: 'errors-only',
    noInfo: true,
    lazy: false,
  },

  entry: {
    'app': path.resolve(__dirname, 'src/index.js'),
  },

  output: IS_DEV ? {
    pathinfo: true,
    publicPath: 'http://localhost:3000/',
    filename: '[name].js'
  } : {
    path: BUILD_DIR,
    filename: '[name].[hash:6].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '',
  },

  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, 'local_modules'),
      SRC_DIR,
    ],
    extensions: [ '.js', '.scss' ],
  },
  
  module: {
    rules: ([

      // BABEL
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          sourceMaps: 'inline',
        },
      },

      {
        test: require.resolve('alight'),
        use: [
          {
            loader: 'expose-loader',
            options: 'alight',
          },
        ],
      },

      // CSS
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },

      // SCSS
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              localIdentName: IS_DEV ? '[local]__[hash:base64:3]' : '[hash:base64:6]',
              sourceMap: IS_DEV,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // data: '@import "./scss/index";',
              includePaths: [
                SRC_DIR,
              ],
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

      // FONTS
      {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',     // where the fonts will go
              publicPath: '../',        // override the default path
            },
          },
        ],
      },

    ])
      .map((rule) => {
        if (IS_DEV) {
          return rule
        }

        if (typeof rule.test !== 'string' && (rule.test.test('*.css') || rule.test.test('*.scss'))) {
          rule.use = ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: rule.use.slice(1),
          })
        }
        
        return rule
      })
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new ProgressBarPlugin({ clear: false }),
    new webpack.DefinePlugin({
      IS_DEV,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      title: 'Swap',
      inject: 'body',
      hash: false,
    }),
  ]
    .concat(IS_DEV ? [] : [
      new ExtractTextPlugin({
        filename: '[name].[hash:6].css',
        allChunks: true,
      }),
      new UglifyJsPlugin({
        mangle: {
          reserved: [
            'Buffer',
            'BigInteger',
            'Point',
            'ECPubKey',
            'ECKey',
            'sha512_asm',
            'asm',
            'ECPair',
            'HDNode'
          ]
        }
      }),
      // new CompressionPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        // this assumes your vendor imports exist in the node_modules directory
        minChunks: (module) => module.context && module.context.indexOf('node_modules') >= 0,
      }),
    ]),
}
