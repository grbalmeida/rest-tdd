const supertest = require('supertest');

const app = require('../../src/app');
const knex = app.db;

const SIGNIN = '/auth/signin';
const SIGNUP = '/auth/signup';

beforeAll(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();
});

afterAll(() => knex.migrate.rollback());

test('Should create a user via signup', async () => {
    const result = await supertest(app)
        .post(SIGNUP)
        .send({ name: 'Olivia', email: 'olivia@email', password: '123456' });

    expect(result.status).toBe(201);
});

test('Should receive a token when logging in', async () => {
    const email = 'walter@email.com';
    const password = '123456';

    await app.services.user.save({
        name: 'Walter',
        email,
        password
    });

    const result = await supertest(app)
        .post(SIGNIN)
        .send({ email, password });

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty('token');
});

test('Should not authenticate a user with a wrong password', async () => {
    const email = 'maria@gmail.com';
    const password = '654321';

    await app.services.user.save({ name: 'Maria', email, password: '123456' });

    const result = await supertest(app)
        .post(SIGNIN)
        .send({ email, password });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Invalid user or password');
});

test('Should not authenticate an invalid user', async () => {
    const result = await supertest(app)
        .post(SIGNIN)
        .send({ email: 'notexists@email', password: '123456' });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Invalid user or password');
});

test('Should not access a protected route without a token', async () => {
    const result = await supertest(app).get('/v1/users');

    expect(result.status).toBe(401);
});