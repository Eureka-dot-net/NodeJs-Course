const fs = require('fs');


const requestHandler = (req, resp) => {
    const url = req.url;
    switch (url) {
        case '/':
            resp.setHeader('Content-Type', 'text/html');
            resp.write('<html>');
            resp.write('<head><title>Enter message</title></head>');
            resp.write('<body><form action="/message" method="POST"><input type="text" name="message" /><button type="submit">Send</button></form></body>');
            resp.write('</html>');
            return resp.end();
        case '/message':
            if (req.method === 'POST') {
                const body = [];
                req.on('data', (chunk) => {
                    body.push(chunk);
                });
                return req.on('end', () => {
                    const parsedBody = Buffer.concat(body).toString();
                    const message = parsedBody.split('=')[1];
                    fs.writeFile('message.txt', message, (err) => {
                        if (err) {
                            console.error('Failed to write message');
                        } else {
                            console.log('Finished writing file');
                            resp.statusCode = 302;
                            resp.setHeader('Location', '/');
                            console.log('ending return');
                            return resp.end();
                        }
                    });

                })
            }
            break;
        default:
            resp.setHeader('Content-Type', 'text/html');
            resp.write('<html>');
            resp.write('<head><title>My first page</title></head>');
            resp.write('<body><h1>Hello from my node.js server!</h1></body>');
            resp.write('</html>');
            return resp.end();
    }
}

exports = requestHandler