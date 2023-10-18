import { eventHandler, getQuery } from 'h3';
import { getUsersPagination } from '../store/users.js';

export default eventHandler(async (event) => {
    const { page= 1, per_page = 6 } = getQuery(event);

    return getUsersPagination({
        per_page,
        page,
    });
});
