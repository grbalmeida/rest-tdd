const app = require('express')();
const consign = require('consign');
const knex = require('knex');

const knexfile = require('../knexfile');

app.db = knex(knexfile.test);

consign({ cwd: 'src', verbose: false })
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./services')
    .then('./routes')
    .then('./config/router.js')
    .into(app);

app.get('/', (request, response) => {
    response.status(200).send();
});

app.use((error, request, response, next) => {
    const { name, message, stack } = error;

    if(name === 'ValidationError') {
        response.status(400).json({ error: message });
    } else if(name === 'UndueRecourseError') {
        response.status(403).json({ error: message });
    } else {
        response.status(500).json({ name, message, stack });
    }

    next();
});

module.exports = app;