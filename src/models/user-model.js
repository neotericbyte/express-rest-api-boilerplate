const Sequelize = require('sequelize');
const sequelize = require('../databases').sequelize;
const { getHash, getMessage } = require('../facades');

let hookHashFields = (user, options, callback) => {
    try {
        if (user.type === 'BULKUCREATE' || user.type === 'BULKUPDATE') {
            if (user.attributes.password) {
                user.attributes.password = getHash(
                    user.attributes.password
                );
            }
        } else {
            if (user._changed.password) {
                user.password = getHash(user.password);
            }
            if (user._changed.email) {
                user.isValidated = false;
                user.validationHash = getHash(JSON.stringify({
                    email: user.email, timestamp: Date.now()
                }));
            }
        }
        if (typeof callback === 'function') { callback(null, options); }
    } catch (error) {
        if (typeof callback === 'function') { callback(null, options); }
    }

}

module.exports = sequelize.define('users',
    {
        id: {
            type: Sequelize.INTEGER.UNSIGNED, primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.STRING(255), allowNull: false,
            validate: { isEmail: true },
            unique: {
                args: true,
                msg: getMessage('error.validation.email.exists'),
                fields: [sequelize.fn('lower', sequelize.col('email'))]
            }
        },
        password: {
            type: Sequelize.STRING(255), allowNull: false,
            validate: {
                notEmpty: {
                    msg: getMessage('error.validation.password.empty')
                }
            }
        },
        firstName: {
            type: Sequelize.STRING(255), allowNull: false,
            validate: { len: [2, 255], notEmpty: true }
        },
        lastName: {
            type: Sequelize.STRING(255), allowNull: false,
            validate: { len: [2, 255], notEmpty: true }
        },
        profileImage: Sequelize.STRING(255),
        isValidated: {
            type: Sequelize.BOOLEAN, defaultValue: 0
        },
        validationHash: { type: Sequelize.STRING(255) },
        bittrexApiKey: {
            type: Sequelize.STRING(255), allowNull: false,
            validate: {
                len: {
                    args: [2, 255],
                    msg: getMessage('error.validation.bittrexApiSecret.invalid')
                }
            }
        },
        bittrexApiSecret: {
            type: Sequelize.STRING(255), allowNull: false,
            validate: {
                len: {
                    args: [2, 255],
                    msg: getMessage('error.validation.bittrexApiSecret.invalid')
                }
            }
        }
    },
    {
        indexes: [{ unique: true, fields: ['email'] }],
        hooks: {
            beforeCreate: hookHashFields, beforeBulkCreate: hookHashFields,
            beforeUpdate: hookHashFields, beforeBulkUpdate: hookHashFields
        }
    }
);

// sequelize.sync({ force: true });
