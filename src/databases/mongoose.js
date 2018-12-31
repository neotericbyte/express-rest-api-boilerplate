const mongoose = require('mongoose');
const config = require('../config');

let connectionInfo = [
    'mongodb://', config.databases.mongo.host, ':',
    config.databases.mongo.port, '/', config.databases.mongo.database
];
if (config.databases.mongo.username) {
    connectionInfo.splice(
        1, 0, config.databases.mongo.username, ':',
        config.databases.mongo.password, '@'
    );
}
const connectionString = connectionInfo.join('');
console.log('Mongoose: connectionString', connectionString);
mongoose.connect(connectionString, config.databases.mongo.options).then(
    () => {
        console.log('Mongoose: Connection has been established.');
    },
    (err) => {
        console.error('Mongoose: Unable to connect to the database:', err);
    }
);
mongoose.close = mongoose.connection.close.bind(mongoose.connection);

module.exports = mongoose;