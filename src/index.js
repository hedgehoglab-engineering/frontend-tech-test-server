#!/usr/bin/env node

import { createApp, createRouter, toNodeListener, eventHandler, handleCors } from 'h3';
import { listen } from 'listhen';
import loginPost from './routes/login.post.js';
import registerPost from './routes/register.post.js';
import usersGet from './routes/users.get.js';
import usersPost from './routes/users.post.js';
import usersDelete from './routes/users.delete.js';

(async () => {
    const router = createRouter()
        .post('/api/login', loginPost)
        .post('/api/register', registerPost)
        .get('/api/users', usersGet)
        .post('/api/users', usersPost)
        .delete('/api/users/:id', usersDelete);

    const app = createApp();

    app.use(eventHandler((event) => {
        handleCors(event, {
            origin: '*',
            methods: [
                'GET',
                'POST',
                'OPTIONS',
                'DELETE',
            ],
        });
    }));

    app.use(router);

    const { url } = await listen(toNodeListener(app), {
        port: 3002,
        name: 'hedgehog lab tech test api',
    });

    const endpoints = [
        {
            method: 'POST',
            endpoint: `${ url }api/register`,
            'requires auth?': false,
        },
        {
            method: 'POST',
            endpoint: `${ url }api/login`,
            'requires auth?': false,
        },
        {
            method: 'GET',
            endpoint: `${ url }api/users`,
            'requires auth?': true,
        },
        {
            method: 'POST',
            endpoint: `${ url }api/users`,
            'requires auth?': true,
        },
        {
            method: 'DELETE',
            endpoint: `${ url }api/users/:id`,
            'requires auth?': true,
        },
    ];

    console.table(endpoints);
})();
