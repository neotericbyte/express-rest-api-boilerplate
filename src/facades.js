const config = require('./config');
const crypto = require('crypto');
const messages = require('./messages');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports.getBaseUrl = () => {
    return (
        (config.ssl ? 'https' : 'http') + '://' + (config.host + config.port || '')
    );
};

module.exports.getHash = (value) => {
    return crypto.createHash('sha256')
        .update(value).digest('hex');
};

module.exports.getMessage = (key) => {
    if (messages[key]) { return messages[key] };
    const keyParts = key.split('.');
    let message = messages;
    for (const i in keyParts) {
        if (!message[keyParts[i]]) { return null; }
        message = message[keyParts[i]];
    }
    return message;
};

module.exports.getSignHmacSha512 = (key, str) => {
    return crypto.createHmac("sha512", key)
        .update(new Buffer(str, 'utf-8')).digest("hex");
}

module.exports.sendMail = (email, subject, template, tokens = {}) => {
    return new Promise((resolve, reject) => {
        console.log('::FIROJ::', tokens);
        fs.readFile(
            path.join(config.templatesDir, 'mail', `${template}.html`),
            'utf8', (err, html) => {
                if (err) { console.log(err); return reject(err); }
                var re = new RegExp(
                    Object.keys(tokens)
                        .map(e => `\{\{${e}\}\}`).join('|'), 'gi'
                );
                console.log(re);
                html = html.replace(re, function (matched) {
                    return tokens[matched.replace(/\}|\{/g, '')];
                });
                var transporter = nodemailer.createTransport(config.smtp);
                transporter.sendMail({
                    from: config.smtp.auth.user, to: email,
                    subject: subject, html: html
                }, (err, info) => {
                    if (err) { console.log(err); return reject(err); }
                    console.log(info);
                    return resolve(true);
                });
            }
        );
    });
}