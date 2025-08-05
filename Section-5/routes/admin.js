const express = require('express');
const path = require('path')

const rootDir = require('../util/path');

const router = express.Router();

router.get('/add-product', (req,res) => {
    res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
});

//use works with all http requests
router.post('/add-product', (req, res) => {
    console.log(req.body);
    res.redirect('/');
});

module.exports = router;