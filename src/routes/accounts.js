module.exports = app => {
    const getById = async (request, response, next) => {
        try {
            const result = await app.services.account.find({ id: request.params.id });
            return response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    const getAll = async (request, response, next) => {
        try {
            const result = await app.services.account.findAll();
            return response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    const create = async (request, response, next) => {
        try {
            const result = await app.services.account.save(request.body);
            return response.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    const update = async (request, response, next) => {
        try {
            const result = await app.services.account.update(request.params.id, request.body);
            return response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    const remove = async (request, response, next) => {
        try {
            await app.services.account.remove(request.params.id);
            return response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    return { create, getAll, getById, update, remove };
};