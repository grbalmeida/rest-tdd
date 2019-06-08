const supertest = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');
const knex = app.db;

const MAIN_ROUTE = '/users';

beforeAll(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();

    await app.services.user.save({
        name: 'User Account',
        email: 'user@email.com',
        password: '123456'
    });

    user = await app.services.user.findOne({ email: 'user@email.com' });
    user.token = jwt.encode(user, 'secret');
});

afterAll(() => knex.migrate.rollback());

test('Should list all users', async () => {
    await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`)
        .send({ name: 'Anderson', email: 'anderson@email.com', password: '123456' });

    const result = await supertest(app)
        .get(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`);

    expect(result.status).toBe(200);
    expect(result.body.length).toBeGreaterThan(0);
});

test('Should insert an user', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`)
        .send({ name: 'Maria', email: 'maria@email.com', password: '123456' });

    expect(result.status).toBe(201);
    expect(result.body).toBeGreaterThan(0);
});

test('Should store an encrypted password', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`)
        .send({ name: 'Mateus', email: 'mateus@email.com', password: '123456' });

    const id = result.body;

    const userDb = await app.services.user.findOne({ id });

    expect(userDb.password).not.toBeUndefined();
    expect(userDb.password).not.toBe('123456');
});

test('Should not insert an user without name', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`)
        .send({ email: 'jorge@email.com', password: '123456' });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Name can not be empty');
});

test('Should not insert an user without email', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`)
        .send({ name: 'Walter', password: '123456' });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Email can not be empty');
});

test('Should not insert an user without password', async () => {
    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set(`authorization`, `Bearer ${user.token}`)
        .send({ name: 'Fernanda', email: 'fernanda@email.com' });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Password can not be empty');
});

test.skip('Should not insert an user with email already exists', async () => {
    const user = { name: 'Augusto', email: 'augusto@email.com', password: '123456' };

    await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`)
        .send(user);

    const result = await supertest(app)
        .post(MAIN_ROUTE)
        .set('authorization', `Bearer ${user.token}`)
        .send(user);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('A user with this email already exists');
});