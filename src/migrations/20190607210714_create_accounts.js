exports.up = knex => {
    return knex.schema.createTable('accounts', (table) => {
        table.increments('id').primary();
        table.string('name').notNull();
        table.integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users');
    });
};

exports.down = knex => {
    return knex.schema.dropTableIfExists('accounts');
};
