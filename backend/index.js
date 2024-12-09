const http = require('http');
const PORT = process.env.PORT || 5000;
const EventEmitter = require('events');

const emitter = new EventEmitter();

class Router {
    constructor() {
        this.endpoints = {};
    }

    request(method = "GET", path, handler) {
        if (!this.endpoints[path]) {
            this.endpoints[path] = {}; // Initialize if not exists
        }

        const endpoints = this.endpoints[path];

        if (endpoints[method]) {
            throw new Error(`[${method}] already registered for ${path}`);
        }

        endpoints[method] = handler;

        emitter.on(`[${path}][${method}]`, (req, res) => {
            handler(req, res);
        });
    }

    handleRequest(req, res) {
        const { method, url } = req;
        const path = url;

        if (this.endpoints[path] && this.endpoints[path][method]) {
            this.endpoints[path][method](req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Route not found' }));
        }
    }
}

const router = new Router();

// Registering some routes
router.request('GET', '/users', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Here are your users' }));
});

router.request('POST', '/post', (req, res) => {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Post created' }));
});

const server = http.createServer((req, res) => {
    router.handleRequest(req, res);
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
