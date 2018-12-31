const Sequelize = require('sequelize');
const getHash = require('../facades').getHash;
const sequelize = require('../databases').sequelize;
const User = require('./user-model');

const Token = sequelize.define('tokens',
    {
        id: {
            type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true
        },
        userId: {
            type: Sequelize.INTEGER.UNSIGNED, allowNull: false
        },
        value: {
            type: Sequelize.STRING(255), allowNull: false
        }
    },
    {
        indexes: [{ unique: true, fields: ['value'] }],
        hooks: {
            beforeCreate: (user, options, callback) => {
                try {
                    if (user._changed.value) { user.value = getHash(user.value); }
                    if (typeof callback === 'function') { callback(null, options); }
                } catch (error) {
                    if (typeof callback === 'function') { callback(null, options); }
                }

            }
        }
    }
);

Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = Token;

// sequelize.sync({ force: true });
