const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

let dbConnection;

// Kết nối MongoDB bằng MongoClient
const connectToDb = (cb) => {
    MongoClient.connect('mongodb://localhost:27017/legoTalk')
        .then((client) => {
            dbConnection = client.db();
            console.log('MongoDB connected via MongoClient');
            cb(null); 
        })
        .catch((err) => {
            console.log('Error connecting to MongoDB with MongoClient:', err);
            cb(err); 
        });
};

// Kết nối Mongoose (ORM)
const connectWithMongoose = () => {
    mongoose.connect('mongodb://localhost:27017/legoTalk')
        .then(() => {
            console.log('MongoDB connected via Mongoose');
        })
        .catch((err) => {
            console.error('Could not connect to MongoDB using Mongoose:', err);
        });
};


const getDb = () => dbConnection;


const getMongooseConnection = () => mongoose.connection;

module.exports = {
    connectToDb,
    connectWithMongoose,
    getDb,
    getMongooseConnection
};
