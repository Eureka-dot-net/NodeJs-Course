const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'nodecomplete',
    database: 'node-complete',
    password: 'nodecomplete'
})

module.exports = pool.promise();