import { createError, eventHandler, sendNoContent } from 'h3';
import { deleteUser, findUser, findUserByToken } from '../store/users.js';
import { ensureAuthenticated, getBearerToken } from '../auth.js';

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

    const { id } = event.context.params;

    const user = findUser(id);

    if (!user) {
        return createError({
            statusCode: 404,
        });
    }

    const bearer = getBearerToken(event);
    const currentUser = findUserByToken(bearer);

    if (currentUser.id === user.id) {
        return createError({
            statusCode: 422,
            data: {
                message: 'Cannot delete own user',
            },
        });
    }

    deleteUser(user.id);

    sendNoContent(event);
});
