import { createError, eventHandler, sendNoContent } from 'h3';
import { deleteUser, findUser } from '../store/users.js';

export default eventHandler(async (event) => {
    const { id } = event.context.params;

    const user = findUser(id);

    if (!user) {
        return createError({
            statusCode: 404,
        });
    }

    deleteUser(user.id);

    sendNoContent(event);
});
