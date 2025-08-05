const express = require('express');
const app = express();

app.get('/', (req, res, next) => {
    console.log('funneling something for fun');
    next();
})

app.get('/users', (req, res, next) => {
    res.send('<h1>Welcome to the users page</h1>');
} )

app.get('/', (req, res, next) => {
    res.send('<h1>Welcome to the home page</h1>');
} )

app.listen(3000);
