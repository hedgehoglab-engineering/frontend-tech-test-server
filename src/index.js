#!/usr/bin/env node

import { createApp, toNodeListener, createRouter } from 'h3';
import { listen } from 'listhen';
import loginPost from './routes/login.post.js';
import registerPost from './routes/register.post.js';
import usersGet from './routes/users.get.js';
import usersPost from './routes/users.post.js';
import usersDelete from './routes/users.delete.js';

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
