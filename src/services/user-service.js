const SequelizeValidationError = require('sequelize').ValidationError;
const validator = require('validator');
const User = require('../models').User;
const Token = require('../models').Token;
const { ValidationError, UnauthorizedError } = require('../errors');
const { getMessage, getHash, sendMail } = require('../facades');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

class UserService {

    constructor() {
        this.copyFile = promisify(fs.copyFile);
    }

    async register(data) {
        try {
            const user = await User.create(data);
            return { id: user.id, ...data };
        } catch (error) { this.handleError(error); }
    }

    async getUserByEmail(email) {
        if (!validator.isEmail(email)) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'email',
                        message: getMessage('error.validation.email.invalid')
                    }
                ]
            );
        }
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'email',
                        message: getMessage('error.validation.email.missing')
                    }
                ]
            );
        }
        return user;
    }

    async getUserByCredentials(email, password) {
        if (!validator.isEmail(email)) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'email',
                        message: getMessage('error.validation.email.invalid')
                    }
                ]
            );
        }
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'email',
                        message: getMessage('error.validation.email.missing')
                    }
                ]
            );
        }
        if (user.password !== getHash(password)) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'password',
                        message: getMessage('error.validation.password.wrong')
                    }
                ]
            );
        }
        return user;
    }

    async getTokenById(id) {
        const token = await Token.create({
            userId: id,
            value: JSON.stringify({ id: id, timestamp: Date.now() })
        });
        return token.value;
    }

    async updatePassword(id, oldPassword, password) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new UnauthorizedError();
        }
        if (getHash(oldPassword) !== user.password) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'oldPassword',
                        message: getMessage('error.validation.oldPassword.wrong')
                    }
                ]
            );
        }
        return !!(await user.update({ password }));
    }

    async sendRecoveryEmail(email) {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'email',
                        message: getMessage('error.validation.email.missing')
                    }
                ]
            );
        }
        const validationHash = getHash(
            JSON.stringify({ email: user.email, timestamp: Date.now() })
        );
        sendMail(
            email, 'Afund.io: Recover Password', 'recover-password',
            { validationHash }).then((res) => {
                console.log(res);
            }).catch((err) => {
                console.log('Recovery Mail Error', err);
            });
        return !!(await user.update({ validationHash }));
    }

    async resetPassword(validationHash, password) {

        const user = await User.findOne({ where: { validationHash } });
        if (!user) {
            throw new ValidationError(
                getMessage('error.validation.general'), [
                    {
                        field: 'validationHash',
                        message: getMessage('error.validation.validationHash.invalid')
                    }
                ]
            );
        }

        return !!(await user.update({ password, validationHash: null }));
    }

    async updateProfile(id, data) {

        const user = await User.findByPk(id);
        if (!user) { throw new UnauthorizedError(); }

        const restrictedFields = ['email', 'password', 'profileImage'];
        for (const field of restrictedFields) { delete data[field]; }
        try {
            return !!(await user.update(data));
        } catch (error) { this.handleError(error); }
    }

    async updateProfileImage(id, fileInfo) {

        const user = await User.findByPk(id);
        if (!user) { throw new UnauthorizedError(); }

        const mimetypes = {
            'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
            'image/pjpeg': 'jpg',
        };

        const { mimetype, filename } = fileInfo;
        const sourceFile = path.join(config.uploadDir, filename);
        const profileImage = `profile-image-${id}.${mimetypes[mimetype]}`;
        const destinationFile = path.join(
            config.publicDir, 'uploads', profileImage
        );
        await this.copyFile(sourceFile, destinationFile);
        try {
            await user.update({ profileImage });
            return `/uploads/${profileImage}`;
        } catch (error) { this.handleError(error); }

    }

    handleError(error) {
        if (error instanceof SequelizeValidationError) {
            const errors = error.errors.map((e) => {
                return { field: e.path, message: e.message }
            });
            throw new ValidationError(
                getMessage('error.validation.general'), errors
            );
        } else {
            throw error;
        }
    }

    async getUserById(id) {
        const user = await User.findByPk(id);
        if (!user) { throw new UnauthorizedError(); }
        return {
            firstName: user.firstName, lastName: user.lastName,
            profileImage: user.profileImage ?
                `/uploads/${user.profileImage}` : null
        }
    }

}

module.exports = new UserService();