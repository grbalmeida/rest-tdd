module.exports = function UndueRecourseError(message = 'This feature doest not belong to the user') {
    this.name = 'UndueRecourseError';
    this.message = message;
};