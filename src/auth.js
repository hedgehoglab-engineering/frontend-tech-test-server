import { getHeaders } from 'h3';
import { findUserByToken } from './store/users.js';
import { UNAUTHENTICATED_EXCEPTION } from './exceptions.js';

const throwUnauthenticated = () => {
    throw new Error(UNAUTHENTICATED_EXCEPTION);
};

export const getBearerToken = (event) => {
    const headers = getHeaders(event);

    const authHeader = headers.authorization || '';

    return authHeader.replace('Bearer ', '');
};

export const ensureAuthenticated = (event) => {
    const bearer = getBearerToken(event);

    const user = findUserByToken(bearer);

    if (!user) {
        throwUnauthenticated();
    }
};
