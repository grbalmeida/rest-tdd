const supertest = require('supertest');

const app = require('../src/app');

test('Should reply in root', () => {
    return supertest(app).get('/')
        .then(response => expect(response.status).toBe(200));
});