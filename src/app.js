const app = require('express')();

app.get('/', (request, response) => {
    response.status(200).send();
});

module.exports = app;