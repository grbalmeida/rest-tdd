const supertest = require('supertest');
const app = require('../../src/app');
const knex = app.db;

const MAIN_ROUTE = '/accounts';

beforeAll(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();

    await app.services.user.save({
        name: 'User Account',
        email: 'user@email.com',
        password: '123456'
    });
});

afterAll(() => knex.migrate.rollback());

test('Should insert an account', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .send({ name: 'Account #1', user_id: 1 });

    expect(result.status).toBe(201);

    const user = await supertest(app)
        .get(`${MAIN_ROUTE}/${result.body[0]}`);

    expect(user.status).toBe(200);
    expect(user.body.name).toBe('Account #1');
    expect(user.body.user_id).toBe(1);
});

test('Should not insert an account without name', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .send({ user_id: 1 });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Name can not be empty');
});

test('Should list all accounts', async () => {
    await app.db('accounts')
        .insert({ name: 'Account list', user_id: 1 });

    const result = await supertest(app).get(MAIN_ROUTE);

    expect(result.status).toBe(200);
    expect(result.body.length).toBeGreaterThan(0);
});

test('Should return an account by id', async () => {
    const account = await app.db('accounts')
        .insert({ name: 'Account by id', user_id: 1 }, '*');

    const result = await supertest(app)
        .get(`${MAIN_ROUTE}/${account[0]}`);

    expect(result.status).toBe(200);
    expect(result.body.name).toBe('Account by id');
    expect(result.body.user_id).toBe(1);
});

test('Should update an account', async () => {
    const result = await app.db('accounts')
        .insert({ name: 'Account to update', user_id: 1 }, '*');

    const update = await supertest(app)
        .put(`${MAIN_ROUTE}/${result[0]}`)
        .send({ name: 'Account updated' });

    expect(update.status).toBe(200);

    const account = await supertest(app)
        .get(`${MAIN_ROUTE}/${result[0]}`);

    expect(account.status).toBe(200);
    expect(account.body.name).toBe('Account updated');
    expect(account.body.user_id).toBe(1);
});

test('Should remove an account', async () => {
    await app.db('accounts')
        .insert({ name: 'Account to remove', user_id: 1 }, '*');

    const remove = await supertest(app)
        .delete(`${MAIN_ROUTE}/${1}`);

    expect(remove.status).toBe(204);
});