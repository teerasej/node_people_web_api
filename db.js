const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://mongodb:27017';
const dbName = 'nfmongop';

const client = new MongoClient(url);

module.exports = client;