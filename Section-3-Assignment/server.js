const http = require('http');

const server = http.createServer((req, res) => {
    const url = req.url;
    if (url === '/') {
        res.write('<html>')
        res.write('<head><title>Assignment 3</title></head>');
        res.write('<body>');
        res.write('<p>Please enter your username</p>');
        res.write('<form action="/create-user" method="POST">');
        res.write('<input type="text" name="userName" />');
        res.write('<button type="submit">Submit</button>')
        res.write('</form>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    }
    if (url === '/create-user' && req.method === 'POST') {
        const buffer = []
        req.on('data', (data) => {
            buffer.push(data)
        });
        req.on('end', () => {
            const body = Buffer.concat(buffer).toString();
            const userName = body.split('=')[1];
            console.log(userName);
        })
        res.write('<html>')
        res.write('<head><title>Assignment 3</title></head>');
        res.write('<body>');
        res.write('<p>Thank you</p>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    }
})

server.listen(3000);