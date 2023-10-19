import { eventHandler, readBody, createError } from 'h3';
import { findUserByAuthCredentials, getUserToken } from '../store/users.js';

export default eventHandler(async (event) => {
    const body = await readBody(event);

    if (!body?.email || !body?.password) {
        const errors = {};

        if (!body?.email) {
            errors.email = ['This field is required'];
        }

        if (!body?.password) {
            errors.password = ['This field is required'];
        }

        return createError({
            statusCode: 422,
            data: {
                errors,
            },
        });
    }

    const user = findUserByAuthCredentials({
        email: body?.email,
        password: body?.password,
    });

    if (!user) {
        return createError({
            statusCode: 422,
            message: 'Invalid credentials',
            data: {
                message: 'Invalid credentials',
            },
        });
    }

    return {
        token: getUserToken(user.id),
    };
});
