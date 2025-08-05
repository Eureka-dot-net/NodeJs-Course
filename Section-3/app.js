const http = require('http');
const routes = require('./routes')

// const rqListener = (req, resp) => {

// }

// http.createServer(rqListener);

// http.createServer(function(req, res) {

// });

const server = http.createServer(routes);

server.listen(3000);