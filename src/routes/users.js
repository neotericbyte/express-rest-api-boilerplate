const router = require('express').Router();
const userService = require('../services').userService;
const ValidationError = require('../errors').ValidationError;
const { getMessage } = require('../facades');
const {
    upload: { uploadImage }, auth: { authenticate }
} = require('../filters');

router.get('/', authenticate, (req, res) => {
    res.send({ userId: req.userId });
});

router.post('/', (req, res, next) => {
    userService.register(req.body).then((user) => {
        res.status(201).send({ success: true, result: user });
    }).catch(next);
});

router.post('/login', (req, res, next) => {
    const errors = [];
    if (!req.body.email) {
        errors.push({
            field: 'email',
            message: getMessage('error.validation.email.empty')
        });
    }
    if (!req.body.password) {
        errors.push({
            field: 'password',
            message: getMessage('error.validation.password.empty')
        });
    }
    if (errors.length) {
        throw new ValidationError(
            getMessage('error.validation.general'), errors
        );
    }

    userService.getUserByCredentials(req.body.email, req.body.password)
        .then((user) => {
            userService.getTokenById(user.id).then((value) => {
                res.send({
                    success: true, result: {
                        firstName: user.firstName, lastName: user.lastName, token: value,
                        profileImage: user.profileImage ?
                            `/uploads/${user.profileImage}` : null
                    }
                });
            }).catch(next);
        }).catch(next);

});

router.post('/change-password', authenticate, (req, res, next) => {

    const errors = [];
    if (!req.body.password) {
        errors.push({
            field: 'password',
            message: getMessage('error.validation.password.empty')
        });
    }
    if (!req.body.oldPassword) {
        errors.push({
            field: 'password',
            message: getMessage('error.validation.oldPassword.empty')
        });
    }
    if (errors.length) {
        throw new ValidationError(
            getMessage('error.validation.general'), errors
        );
    }

    userService.updatePassword(
        req.userId, req.body.oldPassword, req.body.password
    ).then((isUpdated) => {
        res.send({ success: isUpdated });
    }).catch(next);

});

router.post('/send-recovery-mail', (req, res, next) => {

    if (!req.body.email) {
        throw new ValidationError(
            getMessage('error.validation.general'), [
                {
                    field: 'email',
                    message: getMessage('error.validation.email.empty')
                }
            ]
        );
    }

    userService.sendRecoveryEmail(req.body.email).then((emailSent) => {
        res.send({ success: emailSent });
    }).catch(next);

});

router.post('/reset-password', (req, res, next) => {

    const errors = [];
    if (!req.body.validationHash) {
        errors.push({
            field: 'validationHash',
            message: getMessage('error.validation.validationHash.empty')
        });
    }
    if (!req.body.password) {
        errors.push({
            field: 'password',
            message: getMessage('error.validation.password.empty')
        });
    }
    if (errors.length) {
        throw new ValidationError(
            getMessage('error.validation.general'), errors
        );
    }

    userService.resetPassword(req.body.validationHash, req.body.password)
        .then((isUpdated) => {
            res.send({ success: isUpdated });
        }).catch(next);

});

router.post('/profile', authenticate, (req, res, next) => {
    userService.updateProfile(req.userId, req.body)
        .then((isUpdated) => {
            res.send({ success: isUpdated, result: req.body });
        }).catch(next);
});

router.get('/profile', authenticate, (req, res, next) => {
    userService.getUserById(req.userId)
        .then((user) => {
            res.send({ success: true, result: user });
        }).catch(next);
});

router.post('/profile-image', [
    authenticate, uploadImage.single('profileImage')
], (req, res, next) => {
    if (!req.file || req.file['fieldname'] !== 'profileImage') {
        throw new ValidationError(
            getMessage('error.validation.general'), [
                {
                    field: 'profileImage',
                    message: getMessage('error.validation.profileImage.empty')
                }
            ]
        );
    }

    userService.updateProfileImage(req.userId, req.file)
        .then((profileImage) => {
            res.send({ success: true, result: { profileImage } });
        }).catch(next);

})

module.exports = router;