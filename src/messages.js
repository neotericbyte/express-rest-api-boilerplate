module.exports = {
    error: {
        general: 'Something went wrong.',
        validation: {
            general: 'Input validation error.',
            email: {
                empty: 'Email is required.',
                exists: 'Email id already exists.',
                invalid: 'Please provide a valid Email.',
                missing: 'Email id does not exists.'
            },
            password: {
                empty: 'Password is required.',
                wrong: 'Wrong password provided.'
            },
            oldPassword: {
                empty: 'Old password is required.',
                wrong: 'Wrong old password provided.'
            },
            validationHash: {
                empty: 'Validation hash is required.',
                invalid: 'Invalid validation hash provided.'
            },
            bittrexApiKey: {
                invalid: 'Bittrex API key is invalid.',
            },
            bittrexApiSecret: {
                invalid: 'Bittrex API secret is invalid.',
            },
            profileImage: {
                empty: 'Profile image is required.',
                invalid: 'Invalid file uploaded.'
            },
            currencies: {
                empty: 'List of currencies is required.'
            }
        }
    }
}