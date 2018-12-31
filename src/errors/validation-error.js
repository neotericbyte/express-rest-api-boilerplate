module.exports = class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        console.log(errors);
        this.errors = errors;
    }
}