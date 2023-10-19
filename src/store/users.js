import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { VALIDATION_EXCEPTION } from '../exceptions.js';

const modelSchema = {
    id: 'string',
    first_name: 'string',
    last_name: 'string',
    email: 'string',
    display_picture: 'string',
    password: 'string',
};

let autoIncrement = 1;

const userFactory = () => {
    const uuid = autoIncrement++;

    return {
        id: uuid,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        display_picture: `https://i.pravatar.cc/150?u=${ uuid }`,
        password: randomUUID(),
        token: randomUUID(),
    };
};

const userTransformer = (user) => {
    // eslint-disable-next-line no-unused-vars
    const { password, token, ...rest } = user;

    return rest;
};

export const users = Array.from({
    length: 10,
}, () => userFactory());

export const validateUserCreation = (user = {}) => {
    const errors = {};

    [
        'first_name',
        'last_name',
        'email',
    ].forEach((key) => {
        if (!user?.[key]) {
            errors[key] = ['This field is required'];
        }
    });

    if (user?.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(user?.email)) {
        errors.email = errors.email || [];
        errors.email.push('Must be a valid email address');
    }

    if (Object.keys(errors).length) {
        const error = new Error(VALIDATION_EXCEPTION);
        error.errors = errors;

        throw error;
    }

    // eslint-disable-next-line no-unused-vars
    const { password, id, ...rest } = user;

    return rest;
};

export const validateUserRegistration = (user = {}) => {
    const errors = {};

    [
        'first_name',
        'last_name',
        'email',
        'password',
        'password_confirmation',
    ].forEach((key) => {
        if (!user?.[key]) {
            errors[key] = ['This field is required'];
        }
    });

    if (user?.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(user?.email)) {
        errors.email = errors.email || [];
        errors.email.push('Must be a valid email address');
    }

    if (user?.password && user?.password_confirmation && user.password !== user.password_confirmation) {
        errors.password = errors.password || [];
        errors.password.push('Passwords must match');
    }

    if (Object.keys(errors).length) {
        const error = new Error(VALIDATION_EXCEPTION);
        error.errors = errors;

        throw error;
    }

    // eslint-disable-next-line no-unused-vars
    const { id, ...rest } = user;

    return rest;
};

export const addUser = (user) => {
    const schemaValidated = Object.entries(user)
        .reduce((user, [key, value]) => {
            if (Object.keys(modelSchema).includes(key)) {
                user[key] = value;
            }

            return user;
        }, {});

    const newUser = {
        ...userFactory(),
        ...schemaValidated,
    };

    users.push(newUser);

    return newUser;
};

export const getUserToken = (id) => {
    const user = users
        .find((user) => user.id === id);

    if (!user) {
        return;
    }

    return user.token;
};

export const findUser = (id) => {
    const user = users
        .find((user) => String(user.id) === String(id));

    if (!user) {
        return;
    }

    return userTransformer(user);
};

export const findUserByAuthCredentials = ({ email, password }) => {
    const user = users
        .find((user) => user.email === email && user.password === password);

    if (!user) {
        return;
    }

    return userTransformer(user);
};

export const findUserByEmail = (email) => {
    const user = users
        .find((user) => user.email === email);

    if (!user) {
        return;
    }

    return userTransformer(user);
};

export const findUserByToken = (token) => {
    const user = users
        .find((user) => user.token === token);

    if (!user) {
        return;
    }

    return userTransformer(user);
};

export const deleteUser = (id) => {
    const index = users
        .findIndex((user) => user.id === id);

    users.splice(index, 1);
};

export const getUsersPagination = ({ per_page = 5, page } = {}) => {
    const data = users
        .slice((page - 1) * per_page, per_page * page)
        .map(userTransformer);

    return {
        page,
        per_page,
        total: users.length,
        total_pages: Math.ceil(users.length / per_page),
        data,
    };
};
