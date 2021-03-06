const ValidationError = require('../errors/ValidationError');

module.exports = app => {
    const find = (filter = {}) => {
        return app.db('accounts')
            .where(filter)
            .first();
    };

    const findAll = (userId) => {
        return app.db('accounts')
            .select('id', 'name', 'user_id')
            .where({ user_id: userId });
    };

    const save = async account => {
        if(!account.name) throw new ValidationError('Name can not be empty');

        const accountDb = await find({
            name: account.name,
            user_id: account.user_id
        });

        if(accountDb) throw new ValidationError('An account with this name already exists');

        return app.db('accounts')
            .insert(account, '*');
    };

    const update = (id, account) => {
        return app.db('accounts')
            .where({ id })
            .update(account, '*');
    };

    const remove = id => {
        return app.db('accounts')
            .where({ id })
            .del();
    }

    return { find, findAll, save, update, remove };
};