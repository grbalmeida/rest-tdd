const app = require('express')();
const consign = require('consign');
const knex = require('knex');

const knexfile = require('../knexfile');

app.db = knex(knexfile.test);

consign({ cwd: 'src', verbose: false })
    .include('./config/middlewares.js')
    .then('./services')
    .include('./routes')
    .then('./config/routes.js')
    .into(app);

app.get('/', (request, response) => {
    response.status(200).send();
});

app.use((error, request, response, next) => {
    const { name, message, stack } = error;

    if(name === 'ValidationError') {
        response.status(400).json({ error: message });
    } else {
        response.status(500).json({ name, message, stack });
    }

    next();
});

module.exports = app;