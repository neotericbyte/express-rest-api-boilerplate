const Sequelize = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: config.databases.mysql.host,
    port: config.databases.mysql.port,
    database: config.databases.mysql.database,
    username: config.databases.mysql.username,
    password: config.databases.mysql.password
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
