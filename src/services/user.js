const ValidationError = require('../errors/ValidationError');

module.exports = app => {
    const findAll = (filter = {}) => {
        return app.db('users')
            .select('id', 'name', 'email')
            .where(filter);
    };

    const save = async user => {
        if(!user.name) throw new ValidationError('Name can not be empty');
        if(!user.email) throw new ValidationError('Email can not be empty');
        if(!user.password) throw new ValidationError('Password can not be empty');

        const userDb = await findAll({ email: user.email });

        if(userDb && userDb.length > 0) throw new ValidationError('A user with this email already exists');

        return app.db('users').insert(user, '*');
    };

    return { findAll, save };
};