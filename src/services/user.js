module.exports = app => {
    const findAll = (filter = {}) => {
        return app.db('users')
            .select('id', 'name', 'email')
            .where(filter);
    };

    const save = async user => {
        if(!user.name) return { error: 'Name can not be empty' };
        if(!user.email) return { error: 'Email can not be empty' };
        if(!user.password) return { error: 'Password can not be empty' };

        const userDb = await findAll({ email: user.email });

        if(userDb && userDb.length > 0) return { error: 'A user with this email already exists' };

        return app.db('users').insert(user, '*');
    };

    return { findAll, save };
};