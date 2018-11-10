# Quick Start
This is a standard expressjs server. By defaul it serves on all interfaces and on port 3000.

```shell
npm i express-vanilla
```

Create an index.js file:

```javascript
const initialiseServer = require('express-vanilla')

const routes = [
  middleware1,
  middleware2,
  routes1,
  routes2,
]

const server = initialiseServer(routes)

```

# Details

It assumes that static content resolves to the ./public folder. i.e. http://hostname:port/index.html would resolve to ./index.html

You can configure the interface and port with the following env vars:

```console
PORT=3001
HOST=10.19.0.1
```

# Using this server with TLS

Google and Chrome are beginning to score non-TLS sites lower and warning of insecure access. This is primarily why the default port is not 80. The choice of port 3000 is informed by Docker microservices where one or two ports exposed is sufficient and 3000 is usually the service endpoint.

I suggest implementing a reverse proxy to provide SSL termination. Nginx works well, is easy to set up and maintain, and is performant. It is suitable for most cases where traffic is reasonable (don't know exact figures - I would expect a setup to cope fine for 300 requests per minute). Any higher loads should be possible to resolve with a load balancer and additional servers. 

The middleware and routers will be applied to the server in the order they have been added into the array. 

The initialiser returns the express listener which you can attached event handlers to and request a graceful shutdown, etc.

# Default request handlers

It implements an 404 handler for routes which aren't found. If you are creating an SPA, you may prefer to return a default page by appending a router which 
lists .get('*', {function}) as one of its routers.

It implements a standard error handler. You can override it by adding an alternative in the last array element
