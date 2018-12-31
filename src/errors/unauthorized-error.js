module.exports = class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized access.') {
        console.log(message);
        super(message);
    }
}