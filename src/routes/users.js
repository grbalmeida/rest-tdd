module.exports = (app) => {
    const findAll = (request, response, next) => {
        try {
            app.services.user.findAll()
            .then(result => response.status(200).json(result));
        } catch (error) {
            next(error);
        }
    };
    
    const create = async (request, response, next) => {
        try {
            const result = await app.services.user.save(request.body);
            return response.status(201).json(result[0]);
        } catch (error) {
            next(error);
        }
    };

    return { findAll, create };
};