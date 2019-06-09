const express = require('express');

module.exports = app => {
    const router = express.Router();

    router.get('/:id', async (request, response, next) => {
        try {
            const result = await app.services.account.find({ id: request.params.id });
            return response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.get('/', async (request, response, next) => {
        try {
            const result = await app.services.account.findAll();
            return response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.post('/', async (request, response, next) => {
        try {
            const result = await app.services.account.save(request.body);
            return response.status(201).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.put('/:id', async (request, response, next) => {
        try {
            const result = await app.services.account.update(request.params.id, request.body);
            return response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.delete('/:id', async (request, response, next) => {
        try {
            await app.services.account.remove(request.params.id);
            return response.status(204).send();
        } catch (error) {
            next(error);
        }
    });

    return router;
};