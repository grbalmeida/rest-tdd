const supertest = require('supertest');

const app = require('../../src/app');
const knex = app.db;

let email;

beforeEach(() => {
    return knex.migrate.rollback()
        .then(() => knex.migrate.latest())
        .then(() => email = `${Date.now()}@email.com`);
});

afterEach(() => knex.migrate.rollback());

test('Should list all users', async () => {
    await supertest(app)
        .post('/users')
        .send({ name: 'Walter Mitty', email, password: '123456' });

    const result = await supertest(app)
        .get('/users');

    expect(result.status).toBe(200);
    expect(result.body.length).toBeGreaterThan(0);
});

test('Should insert an user', async () => {
    const result = await supertest(app)
        .post('/users')
        .send({ name: 'Walter Mitty', email, password: '123456' });

    expect(result.status).toBe(201);
    expect(result.body).toBeGreaterThan(0);
});

test('Should not insert an user without name', async () => {
    const result = await supertest(app)
        .post('/users')
        .send({ email, password: '123456' });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Name can not be empty');
});

test('Should not insert an user without email', async () => {
    const result = await supertest(app)
        .post('/users')
        .send({ name: 'Walter Mitty', password: '123456' });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Email can not be empty');
});

test('Should not insert an user without password', async () => {
    const result = await supertest(app)
        .post('/users')
        .send({ name: 'Walter Mitty', email });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Password can not be empty');
});

test('Should not insert an user with email already exists', async () => {
    const user = { name: 'Walter Mitty', email, password: '123456' };

    await supertest(app)
        .post('/users')
        .send(user);

    const result = await supertest(app)
        .post('/users')
        .send(user);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('A user with this email already exists');
});