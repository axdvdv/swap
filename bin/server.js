const webpack               = require('webpack')
const express               = require('express')
const bodyParser            = require('body-parser')
const historyApiFallback    = require('connect-history-api-fallback')
const webpackMiddleware     = require('webpack-dev-middleware')
const webpackConfig         = require('../webpack.config')


const port      = 3000
const app       = express()
const compiler  = webpack(webpackConfig)

app.disable('x-powered-by')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ strict: true, limit: '10mb' }))
app.use(historyApiFallback())
app.use(webpackMiddleware(compiler, webpackConfig.devServer))

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port)
})
