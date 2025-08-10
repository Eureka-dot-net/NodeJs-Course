const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://nodecomplete:nodecomplete@node-cluster.htxzttq.mongodb.net/shop?retryWrites=true&w=majority&appName=node-cluster')
        .then((client) => {
            _db = client.db();
            callback(client)
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
}

const getDb = () => {
    if (_db) {
        return _db;
    }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;