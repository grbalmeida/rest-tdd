const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

const ValidationError = require('../errors/ValidationError');

const secret = 'secret';

module.exports = (app) => {
    const signin = async (request, response, next) => {
        try {
            const user = await app.services.user.findOne({
                email: request.body.email
            });
            
            if(!user) throw new ValidationError('Invalid user or password');

            if(bcrypt.compareSync(request.body.password, user.password)) {
                const { id, name, email } = user;
                const payload = { id, name, email };
                const token = jwt.encode(payload, secret);
                response.status(200).json({ token });
            } else {
                throw new ValidationError('Invalid user or password');
            }
        } catch (error) {
            next(error);
        }
    };

    return { signin };
};