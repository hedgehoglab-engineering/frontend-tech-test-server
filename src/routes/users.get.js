import { createError, eventHandler, getQuery } from 'h3';
import { getUsersPagination } from '../store/users.js';
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

    const { page= 1, per_page = 6 } = getQuery(event);

    return getUsersPagination({
        per_page,
        page,
    });
});
