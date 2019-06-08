const bcrypt = require('bcrypt-nodejs');

const ValidationError = require('../errors/ValidationError');

module.exports = app => {
    const findAll = () => {
        return app.db('users')
            .select('id', 'name', 'email');
    };

    const findOne = (filter = {}) => {
        return app.db('users')
            .where(filter)
            .first();
    };

    const getPasswordHash = password => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    };

    const save = async user => {
        if(!user.name) throw new ValidationError('Name can not be empty');
        if(!user.email) throw new ValidationError('Email can not be empty');
        if(!user.password) throw new ValidationError('Password can not be empty');

        const userDb = await findOne({ email: user.email });
        const userWithEncryptedPassword = { ...user };

        if(userDb) throw new ValidationError('A user with this email already exists');

        userWithEncryptedPassword.password = getPasswordHash(user.password);
        return app.db('users').insert(userWithEncryptedPassword, '*');
    };

    return { findAll, save, findOne };
};