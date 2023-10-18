import { eventHandler, readBody, createError, getQuery, sendNoContent, createRouter, createApp, toNodeListener } from 'h3';
import { listen } from 'listhen';
import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';

const VALIDATION_EXCEPTION = 'VALIDATION_EXCEPTION';

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
    };
};

const userTransformer = (user) => {
    // eslint-disable-next-line no-unused-vars
    const { password, ...rest } = user;

    return rest;
};

const users = Array.from({
    length: 10,
}, () => userFactory());

const validateUserCreation = (user = {}) => {
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

const validateUserRegistration = (user = {}) => {
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

const addUser = (user) => {
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

const findUser = (id) => {
    const user = users
        .find((user) => user.id === id);

    if (!user) {
        return;
    }

    return userTransformer(user);
};

const findUserByAuthCredentials = ({ email, password }) => {
    const user = users
        .find((user) => user.email === email && user.password === password);

    if (!user) {
        return;
    }

    return userTransformer(user);
};

const findUserByEmail = (email) => {
    const user = users
        .find((user) => user.email === email);

    if (!user) {
        return;
    }

    return userTransformer(user);
};

const deleteUser = (id) => {
    const index = users
        .findIndex((user) => user.id === id);

    users.splice(index, 1);
};

const getUsersPagination = ({ per_page = 5, page } = {}) => {
    return {
        page,
        per_page,
        total: users.length,
        total_pages: Math.ceil(users.length / per_page),
        data: users
            .slice((page - 1) * per_page, per_page)
            .map(userTransformer),
    };
};

var loginPost = eventHandler(async (event) => {
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

    return findUser(user.id);
});

var registerPost = eventHandler(async (event) => {
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

var usersGet = eventHandler(async (event) => {
    const { page= 1, per_page = 6 } = getQuery(event);

    return getUsersPagination({
        per_page,
        page,
    });
});

var usersPost = eventHandler(async (event) => {
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

var usersDelete = eventHandler(async (event) => {
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

const router = createRouter()
    .post('/api/login', loginPost)
    .post('/api/register', registerPost)
    .get('/api/users', usersGet)
    .post('/api/users', usersPost)
    .delete('/api/users/:id', usersDelete);

const app = createApp();

app.use(router);

listen(toNodeListener(app), {
    port: 3002,
    name: 'hedgehog lab tech test api',
});
