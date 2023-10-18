import { createError, eventHandler, readBody } from 'h3';
import { addUser, findUser, findUserByEmail, validateUserRegistration } from '../store/users.js';

export default eventHandler(async (event) => {
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
        const validatedData = validateUserRegistration(userData);

        console.log({ validatedData });

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
