const ValidationError = require('../errors/ValidationError');

module.exports = app => {
    const find = (filter = {}) => {
        return app.db('accounts')
            .where(filter)
            .first();
    };

    const findAll = () => {
        return app.db('accounts')
            .select('id', 'name', 'user_id');
    };

    const save = account => {
        if(!account.name) throw new ValidationError('Name can not be empty');

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