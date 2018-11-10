const assert = require('assert')

const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const morgan = require('morgan')
const express = require('express')
const logger = require('./utils/logger')

/**
 * Initialise an express js server with helmet implemented for security, morgan for logging serving
 * static content from public and accepting an array of express handlers such as middleware, 
 * request handlers and error handlers.
 * 
 * Assumes a default port of 3000 mounted to all the machines interfaces. See params for customisation.
 * 
 * In development (set NODE_ENV to 'development') it allows all CORS requests. I don't recommend this for prod
 * 
 * @param {Object || Array} arg1 - optional set of otpions. Omit if you want to use the defaults
 * @param {Array || null} arg2 - optional array of handlers such as middleware and ```Router```s (const Router = require('express).Router)
 * @param {Array} options list of customisation options:
 * @param {String} options.port port to mount expressjs to. This can also be provided as an ENV variable PORT. Default 3000
 * @param {String} options.host the interface to mount express to. You can provide a unix socket path for this. Default 0.0.0.0. Can be provided via ENV var HOST_ADDR (or use machine's HOST)
 * @param {Object} options.morganOpts morgan options (https://www.npmjs.com/package/morgan) Default 'dev'
 */
const initialiseServer = async (arg1, arg2) => {
  /////////////////////////
  // validate configuration
  /////////////////////////

  let options
  let handlers // routers (request handlers) and middleware

  if(Array.isArray(arg1)) {
    handlers = arg1
  } else {
    options = arg1
    handlers = arg2
  }

  const port = (options && options.port) ? options.port : process.env.PORT || '3000'
  const host = (options && options.host) ? options.host : process.env.HOST_ADDR || process.env.HOST || '0.0.0.0'

  ///////////////////
  // Configure server
  ///////////////////
  const app = express()

  app.set('port', port)
  app.set('host', host)

  if(process.env.NODE_ENV==='development') {
    app.use(cors())
  }

  app.use(helmet())
  app.use(morgan(opts))

  ///////////////////
  // Serve statics
  ///////////////////
  app.use(express.static(path.join(__dirname, 'public')))

  //////////////////////////////////////////////
  // configure handlers
  // - assumes array of handlers is 
  // - 1) Middleware
  // followed by
  // - 2) request handlers or routers
  // - 3) override default/no router found handler
  // - 4) override error handler
  //////////////////////////////////////////////
  arg2.forEach(handler => {
    app.use(handler)    
  });

  //////////////////////////////////////////////
  // Catch 404 and forward to error handler
  //////////////////////////////////////////////
  app.use((req, res, next) => {
    const err = new Error(`${new Date()} Route not Found ${req.path}`)
    err.status = 404
    next(err)
  })
  
  //////////////////////////////////////////////
  // Error handler
  //////////////////////////////////////////////
  app.use((error, req, res) => { // eslint-disable-line no-unused-vars
    res
      .status(error.status || 500)
      .send({error})
  })  

  const server = app.listen(app.get('port'), app.get('host'), () => {
    logger.log('info', `Login manager started at http://${app.get('host')}:${app.get('port')}`)
  })

  return server
}

export default initialiseServer
