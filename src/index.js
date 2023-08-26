"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const http_proxy_1 = __importDefault(require("@fastify/http-proxy"));
const axios_1 = __importDefault(require("axios"));
const axios_2 = require("./api/axios");
const crypto_1 = require("crypto");
let sessionToken = '';
let refreshToken = '';
let userId = '';
function hashPassword(password) {
    return (0, crypto_1.createHash)('sha-256').update(password).digest('hex');
}
async function refreshAPIToken() {
    if (!refreshToken || !userId) {
        return;
    }
    try {
        const { data } = await axios_2.axiosInstance.post('refresh', {
            userId,
            refreshToken,
        });
        sessionToken = data.sessionToken;
        refreshToken = data.refreshToken;
        // console.log('API Token Refreshed:', new Date())
    }
    catch (error) {
        console.error('Error refreshing API token:', error);
    }
}
const server = (0, fastify_1.default)({ requestTimeout: 30000 });
server.register(cors_1.default, { origin: ['http://localhost:5173'] });
server.register(helmet_1.default);
server.register(http_proxy_1.default, {
    upstream: 'https://api.ajax.systems/api/',
    prefix: '/api',
    preHandler: (request, _, next) => {
        request.headers['X-Api-Key'] = 'TIulbo0gre8eKjFtsBAWGMK/VDrIRxfE';
        request.headers['X-Session-Token'] = sessionToken;
        next();
    },
});
server.get('/', async (request, reply) => {
    reply.send('Hello Fastify!');
});
server.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    try {
        const { data } = await axios_2.axiosInstance.post('login', {
            login: email,
            passwordHash: hashPassword(password),
            userRole: 'USER',
        });
        sessionToken = data.sessionToken;
        refreshToken = data.refreshToken;
        userId = data.userId;
        setInterval(refreshAPIToken, 12 * 60 * 1000);
        reply.send(data.userId);
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            reply.status(status).send(data);
        }
        else {
            throw error;
        }
    }
});
const port = Number(process.env.PORT) || 3000;
const host = 'RENDER' in process.env ? '0.0.0.0' : 'localhost';
console.log(port);
server.listen({ host, port }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`Server is listening on port: ${address}`);
});
