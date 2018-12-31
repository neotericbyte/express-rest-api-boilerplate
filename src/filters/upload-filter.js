const multer = require('multer');
const { uploadDir } = require('../config');
const { getMessage } = require('../facades');
const { ValidationError } = require('../errors');

module.exports.uploadImage = multer({
    dest: uploadDir, fileFilter: (req, file, callback) => {

        const mimetypes = {
            'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
            'image/pjpeg': 'jpg',
        };

        if (!mimetypes[file['mimetype']]) {
            let msg = getMessage('error.validation.profileImage.invalid');
            msg = `${msg} Valid files: ${Object.values(mimetypes).join()}`;
            callback(new ValidationError(
                getMessage('error.validation.general'), [
                    { field: 'profileImage', message: msg }
                ]
            ), null);
        }
        callback(null, true);

    }
});