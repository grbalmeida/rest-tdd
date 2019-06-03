const app = require('express')();
const consign = require('consign');
const knex = require('knex');
// const knexLogger = require('knex-logger');

const knexfile = require('../knexfile');

app.db = knex(knexfile.test);

// app.use(knexLogger(app.db));

consign({ cwd: 'src', verbose: false })
    .include('./config/middlewares.js')
    .then('./services')
    .include('./routes')
    .then('./config/routes.js')
    .into(app);

app.get('/', (request, response) => {
    response.status(200).send();
});

module.exports = app;