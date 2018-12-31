const path = require('path');

module.exports = {
    host: process.env['HOST'] || 'localhost',
    ssl: process.env['SSL'] === 'true' || false,
    port: process.env['PORT'] || 8080,
    databases: {
        mysql: {
            host: process.env['MYSQL_HOST'] || 'localhost',
            port: process.env['MYSQL_PORT'] || 3306,
            username: process.env['MYSQL_USERNAME'] || 'dbuser',
            password: process.env['MYSQL_PASSWORD'] || '',
            database: process.env['MYSQL_DATABASE'] || 'webapp',
        },
        mongo: {
            host: process.env['MONGO_HOST'] || 'localhost',
            port: process.env['MONGO_PORT'] || 27017,
            username: process.env['MONGO_USERNAME'] || 'dbuser',
            password: process.env['MONGO_PASSWORD'] || '12345',
            database: process.env['MONGO_DATABASE'] || 'webapp',
            options: {
                authSource: process.env['MONGO_AUTH_SOURCE'] || 'admin'
            }
        }
    },
    cors: {
        origins: [],
        headers: ['Token', 'Content-Type']
    },
    smtp: {
        host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
        port: process.env['SMTP_PORT'] || 465,
        service: process.env['SMTP_SERVICE'] || 'gmail',
        secure: process.env['SMTP_SECURE'] === 'true' || true,
        auth: {
            user: process.env['SMTP_AUTH_USERNAME'] || '',
            pass: process.env['SMTP_AUTH_PASSWORD'] || ''
        }
    },
    publicDir: path.join(path.dirname(__dirname), 'public'),
    templatesDir: path.join(__dirname, 'templates'),
    uploadDir: path.join(path.dirname(__dirname), 'tmp', 'uploads'),
};
