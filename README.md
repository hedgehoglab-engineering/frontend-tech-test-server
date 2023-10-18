![hedgehog lab logo](https://github.com/hedgehoglab-engineering/frontend-tech-test-server/raw/main/assets/images/hhl-logo-dark.png)

# @hedgehoglab/frontend-tech-test-server

This package provides a simple temporarily persistent server to accompany the technical test set out for new candidates.

## Usage

Running the following command will start the server on your local machine.

```bash
npx @hedgehoglab/frontend-tech-test-server@latest
```

## Documentation

The server exposes a handful of endpoints for the purposes of the technical test. Data will be persisted for the duration of the process. Once the process is stopped the data will be lost.

All endpoints accept JSON, so an appropriate `Content-Type` should be used.

### Authentication

Endpoints requiring authentication should pass the `Authorization` header to the endpoint, with a value of `Bearer <user token>` where `<user token>` is replaced with the token returned from the `/api/login` endpoint.

### Endpoints

#### `POST /api/register`

> Register a new user.

##### Request Body

```js
{
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "password": "string",
    "password_confirmation": "string"
}
```

##### Response

```js
// Status 200
{
    "id": "number",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "display_picture": "string"
}
```

```js
// Status 422
{
    "statusCode": 422,
    "data": {
        "errors": {
            "first_name": [
                "string"
            ],
            "last_name": [
                "string"
            ],
            "email": [
                "string"
            ],
            "password": [
                "string"
            ],
            "password_confirmation": [
                "string"
            ]
        }
    }
}
```

```js
// Status 409
{
    "statusCode": 409,
    "data": {
        "message": "string"
    }
}
```

#### `POST /api/login`

> Login as a registered user.

##### Request Body

```js
{
    "email": "string",
    "password": "string"
}
```

##### Response

```js
// Status 200
{
    "token": "string"
}
```

```js
// Status 422
{
    "statusCode": 422,
    "data": {
        "message": "string"
    }
}
```

#### `GET /api/users`

> Get a list of users.
 
**🔐 Authentication required**

##### Query params

```js
{
    "per_page": "number", // optional, default: 10
    "page": "number" // optional, default: 1
}
```

##### Response

```js
// Status 200
{
    "page": "number",
    "per_page": "number",
    "total": "number",
    "total_pages": "number",
    "data": [
        {
            "id": "number",
            "first_name": "string",
            "last_name": "string",
            "email": "string",
            "display_picture": "string"
        }
    ]
}
```

```js
// Status 401
{
    "statusCode": "number",
    "data": {
        "message": "string"
    }
}
```

#### `POST /api/users`

> Create a new user.

**🔐 Authentication required**

##### Request Body

```js
{
    "first_name": "string",
    "last_name": "string",
    "email": "string"
}
```

##### Response

```js
// Status 200
{
    "id": "number",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "display_picture": "string"
}
```

```js
// Status 401
{
    "statusCode": "number",
    "data": {
        "message": "string"
    }
}
```

#### `DELETE /api/users/:id`

> Delete a user.

**🔐 Authentication required**

##### Response

```js
// Status: 204
```

```js
// Status 422
{
    "statusCode": 422,
    "data": {
        "message": "string"
    }
}
```

```js
// Status 401
{
    "statusCode": 401,
    "data": {
        "message": "string"
    }
}
```
