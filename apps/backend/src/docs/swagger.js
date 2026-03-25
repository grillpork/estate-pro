export const swaggerDocument = {
    openapi: '3.0.3',
    info: {
        title: 'Estate Pro Backend API',
        version: '1.0.0',
        description: 'API documentation for estate-pro backend',
    },
    servers: [
        {
            url: 'http://localhost:4000',
            description: 'Local development server',
        },
    ],
    tags: [
        { name: 'Health' },
        { name: 'Auth' },
        { name: 'Users' },
        { name: 'Properties' },
        { name: 'Brands' },
        { name: 'Landmarks' },
        { name: 'Uploads' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    error: { type: 'string' },
                },
            },
            AuthRegisterRequest: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                },
            },
            AuthLoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
            AuthLoginResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    role: { type: 'string' },
                },
            },
            UserUpdateRequest: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    password: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    role: { type: 'string' },
                },
            },
            Property: {
                type: 'object',
                description: 'Property payload/response shape from database',
                additionalProperties: true,
            },
            Brand: {
                type: 'object',
                description: 'Brand payload/response shape from database',
                additionalProperties: true,
            },
            Landmark: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    type: { type: 'string', example: 'MRT' },
                    line: { type: 'string' },
                    color: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    distance: { type: 'number' },
                },
            },
            LandmarkListResponse: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    stations: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Landmark' },
                    },
                },
            },
        },
    },
    paths: {
        '/upload': {
            post: {
                tags: ['Uploads'],
                summary: 'Upload a file',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['fileupload'],
                                properties: {
                                    fileupload: {
                                        type: 'string',
                                        format: 'binary',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Upload complete',
                        content: {
                            'text/plain': {
                                schema: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        '/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Register successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: 'Invalid request format' },
                    409: { description: 'Username or email already exists' },
                    500: { description: 'Internal server error' },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login and receive JWT',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthLoginRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthLoginResponse' },
                            },
                        },
                    },
                    401: { description: 'Invalid username or password' },
                    500: { description: 'Internal server error' },
                },
            },
        },
        '/api/users': {
            get: {
                tags: ['Users'],
                summary: 'Get all users (current code returns first row)',
                responses: {
                    200: {
                        description: 'User response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                },
            },
        },
        '/api/user/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get user by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'User data',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/User' },
                                },
                            },
                        },
                    },
                },
            },
            patch: {
                tags: ['Users'],
                summary: 'Update user by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserUpdateRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Updated user',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/User' },
                                },
                            },
                        },
                    },
                    500: { description: 'Internal server error' },
                },
            },
            delete: {
                tags: ['Users'],
                summary: 'Delete user by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Delete result',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/properties': {
            get: {
                tags: ['Properties'],
                summary: 'Get all properties',
                responses: {
                    200: {
                        description: 'Property list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Property' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Properties'],
                summary: 'Create property',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Property' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Created property',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Property' },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Internal server error' },
                },
            },
        },
        '/properties/my': {
            get: {
                tags: ['Properties'],
                summary: 'Get my properties',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Owned properties',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Property' },
                                },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/properties/{id}': {
            get: {
                tags: ['Properties'],
                summary: 'Get property by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Property data',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Property' },
                            },
                        },
                    },
                    404: { description: 'Property not found' },
                },
            },
            put: {
                tags: ['Properties'],
                summary: 'Update property by ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Property' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Updated property',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Property' },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Property not found' },
                },
            },
            delete: {
                tags: ['Properties'],
                summary: 'Delete property by ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Delete result',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Property not found' },
                },
            },
        },
        '/brands': {
            get: {
                tags: ['Brands'],
                summary: 'Get all brands',
                responses: {
                    200: {
                        description: 'Brand list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Brand' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Brands'],
                summary: 'Create brand',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Brand' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Created brand',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Brand' },
                            },
                        },
                    },
                },
            },
        },
        '/brands/{id}': {
            get: {
                tags: ['Brands'],
                summary: 'Get brand by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Brand data',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Brand' },
                            },
                        },
                    },
                    404: { description: 'Brand not found' },
                },
            },
            put: {
                tags: ['Brands'],
                summary: 'Update brand by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Brand' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Updated brand',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Brand' },
                            },
                        },
                    },
                    404: { description: 'Brand not found' },
                },
            },
            delete: {
                tags: ['Brands'],
                summary: 'Delete brand by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Delete result',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    404: { description: 'Brand not found' },
                },
            },
        },
        '/landmarks': {
            get: {
                tags: ['Landmarks'],
                summary: 'Get all landmarks',
                parameters: [
                    {
                        name: 'type',
                        in: 'query',
                        required: false,
                        schema: {
                            type: 'string',
                            enum: ['MRT', 'BTS'],
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'Landmark list',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LandmarkListResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/landmarks/nearby': {
            get: {
                tags: ['Landmarks'],
                summary: 'Get nearby landmarks by coordinates',
                parameters: [
                    {
                        name: 'lat',
                        in: 'query',
                        required: true,
                        schema: { type: 'number' },
                    },
                    {
                        name: 'lng',
                        in: 'query',
                        required: true,
                        schema: { type: 'number' },
                    },
                    {
                        name: 'radius',
                        in: 'query',
                        required: false,
                        schema: { type: 'number', default: 1000 },
                    },
                    {
                        name: 'type',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', enum: ['MRT', 'BTS'] },
                    },
                    {
                        name: 'line',
                        in: 'query',
                        required: false,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Nearby landmarks',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LandmarkListResponse' },
                            },
                        },
                    },
                    400: { description: 'lat and lng are required' },
                    500: { description: 'Internal server error' },
                },
            },
        },
    },
}
