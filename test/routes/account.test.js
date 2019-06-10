const supertest = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');
const knex = app.db;

const MAIN_ROUTE = '/v1/accounts';

let firstUser;
let secondUser;

beforeAll(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();

    await app.services.user.save({
        name: 'User Account',
        email: 'user@email.com',
        password: '123456'
    });

    await app.services.user.save({
        name: 'Other user',
        email: 'otheruser@email.com',
        password: '123456'
    });

    firstUser = await app.services.user.findOne({ email: 'user@email.com' });
    firstUser.token = jwt.encode(firstUser, 'secret');

    secondUser = await app.services.user.findOne({ email: 'otheruser@email.com' });
    secondUser.token = jwt.encode(secondUser, 'secret');
});

afterAll(() => knex.migrate.rollback());

test.skip('Should list only user accounts', async () => {
    await app.db('accounts')
        .insert({ name: 'Account #1', user_id: firstUser.id });
    
    await app.db('accounts')
        .insert({ name: 'Account #2', user_id: secondUser.id });

    const result = await supertest(app)
        .get(MAIN_ROUTE)
        .set('authorization', `Bearer ${firstUser.token}`);

    expect(result.status).toBe(200);
    expect(result.body.length).toBe(1);
    expect(result.body[0].name).toBe('Account #1');
});

test.skip('Should insert an account', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${firstUser.token}`)
        .send({ name: 'Account #1', user_id: 1 });

    expect(result.status).toBe(201);

    const user = await supertest(app)
        .get(`${MAIN_ROUTE}/${result.body[0]}`)
        .set('authorization', `Bearer ${firstUser.token}`);

    expect(user.status).toBe(200);
    expect(user.body.name).toBe('Account #1');
    expect(user.body.user_id).toBe(1);
});

test('Should not insert an account without name', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${firstUser.token}`)
        .send({ user_id: 1 });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Name can not be empty');
});

test('Should not insert a duplicate name account for the same user', async () => {
    await app.db('accounts')
        .insert({ name: 'Duplicated account', user_id: firstUser.id });

    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .send({ name: 'Duplicated account', user_id: firstUser.id })
        .set('authorization', `Bearer ${firstUser.token}`);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('An account with this name already exists');    
});

test('Should not return an account from another user', async () => {
    const account = await app.db('accounts')
        .insert({ name: 'Account user 1', user_id: firstUser.id });

    const result = await supertest(app)
        .get(`${MAIN_ROUTE}/${account[0]}`)
        .set('authorization', `Bearer ${secondUser.id}`);

    expect(result.status).toBe(403);
    expect(result.body.error).toBe('This feature doest not belong to the user');
});

test('Should not update another user\'s account', async () => {
    const account = await app.db('accounts')
        .insert({ name: 'Account update 1', user_id: firstUser.id });

    const result = await supertest(app)
        .put(`${MAIN_ROUTE}/${account[0]}`)
        .set('authorization', `Bearer ${secondUser.id}`)
        .send({ name: 'Updated account 1' });

    expect(result.status).toBe(403);
    expect(result.body.error).toBe('This feature doest not belong to the user');
});

test('Should not delete another user\'s account', async () => {
    const account = await app.db('accounts')
        .insert({ name: 'Account delete 1', user_id: firstUser.id });

    const result = await supertest(app)
        .delete(`${MAIN_ROUTE}/${account[0]}`)
        .set('authorization', `Bearer ${secondUser.id}`);

    expect(result.status).toBe(403);
    expect(result.body.error).toBe('This feature doest not belong to the user');
});

test('Should list all accounts', async () => {
    await app.db('accounts')
        .insert({ name: 'Account list', user_id: 1 });

    const result = await supertest(app)
        .get(MAIN_ROUTE)
        .set('authorization', `Bearer ${firstUser.token}`);

    expect(result.status).toBe(200);
    expect(result.body.length).toBeGreaterThan(0);
});

test('Should return an account by id', async () => {
    const account = await app.db('accounts')
        .insert({ name: 'Account by id', user_id: 1 }, '*');

    const result = await supertest(app)
        .get(`${MAIN_ROUTE}/${account[0]}`)
        .set('authorization', `Bearer ${firstUser.token}`);

    expect(result.status).toBe(200);
    expect(result.body.name).toBe('Account by id');
    expect(result.body.user_id).toBe(1);
});

test('Should update an account', async () => {
    const result = await app.db('accounts')
        .insert({ name: 'Account to update', user_id: 1 }, '*');

    const update = await supertest(app)
        .put(`${MAIN_ROUTE}/${result[0]}`)
        .set('authorization', `Bearer ${firstUser.token}`)
        .send({ name: 'Account updated' });

    expect(update.status).toBe(200);

    const account = await supertest(app)
        .get(`${MAIN_ROUTE}/${result[0]}`)
        .set('authorization', `Bearer ${firstUser.token}`);

    expect(account.status).toBe(200);
    expect(account.body.name).toBe('Account updated');
    expect(account.body.user_id).toBe(1);
});

test('Should remove an account', async () => {
    await app.db('accounts')
        .insert({ name: 'Account to remove', user_id: 1 }, '*');

    const remove = await supertest(app)
        .delete(`${MAIN_ROUTE}/${1}`)
        .set('authorization', `Bearer ${firstUser.token}`);

    expect(remove.status).toBe(204);
});