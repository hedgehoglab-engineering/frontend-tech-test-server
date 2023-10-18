import { eventHandler, readBody, createError } from 'h3';
import { addUser, findUser, findUserByEmail, validateUserCreation } from '../store/users.js';
import { ensureAuthenticated } from '../auth.js';

export default eventHandler(async (event) => {
    try {
        ensureAuthenticated(event);
    } catch (e) {
        return createError({
            message: 'unauthorized',
            statusCode: 401,
            data: {
                message: 'Unauthorized',
            },
        });
    }

    const userData = await readBody(event);

    if (findUserByEmail(userData?.email)) {
        return createError({
            statusCode: 409,
            data: {
                message: 'User already exists for the email provided',
            },
        });
    }

    try {
        const validatedData = validateUserCreation(userData);

        const user = addUser(validatedData);

        return findUser(user.id);
    } catch (e) {
        return createError({
            statusCode: 422,
            data: {
                errors: e.errors,
            },
        });
    }
});
