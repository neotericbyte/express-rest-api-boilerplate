const Token = require('../models').Token;
const moment = require('moment');
const { Op } = require('sequelize');

module.exports.authenticate = (req, res, next) => {
    if (!req.headers.token) {
        return res.status(401).send({
            success: false, message: 'Authorization token missing.'
        });
    }

    Token.findOne({
        where: {
            value: req.headers.token, updatedAt: {
                [Op.gte]: moment().subtract(30, 'minutes').toDate()
            }
        }
    }).then((token) => {
        if (token) {
            req.userId = token.userId; next();
            Token.update(
                { updatedAt: moment().toDate() }, {
                    where: { id: token.id }, silent: true
                }
            );
        } else {
            return res.status(401).send({
                success: false, message: 'Invalid authorization token.'
            });
        }
    });

}