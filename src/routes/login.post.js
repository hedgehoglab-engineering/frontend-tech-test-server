import { eventHandler, readBody, createError } from 'h3';
import { findUserByAuthCredentials, getUserToken } from '../store/users.js';

export default eventHandler(async (event) => {
    const body = await readBody(event);

    if (!body?.email || !body?.password) {
        return createError({
            statusCode: 422,
            data: {
                errors: {
                    email: ['This field is required'],
                    password: ['This field is required'],
                },
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
