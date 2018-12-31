class Server {

    constructor() {
        this.config = require('./config'); this.express = require('express');
        this.app = this.express();
        if (this.config.ssl === true) {
            const fs = require('fs');
            this.instance = require('https').createServer({
                key: fs.readdirSync(this.config.keyFile),
                cert: fs.readdirSync(this.config.crtFile)
            }, this.app);
        } else {
            this.instance = require('http').createServer(this.app);
        }
    }

    initializeBodyParser() {
        const bodyParser = require('body-parser');
        this.app.use(bodyParser.json());
        return this;
    }

    initializeRoutes() {
        const routes = require('./routes/index');
        for (const path in routes) {
            this.app.use('/api/' + path, routes[path]);
        }
        return this;
    }

    initializeStaticPath() {
        this.app.use(this.express.static(this.config.publicDir));
        return this;
    }

    initializeDefaultRouteToIndexPage() {
        const path = require('path');
        this.app.all('*', (req, res) => {
            res.sendFile(
                path.join(this.config.publicDir, 'index.html')
            );
        })
        return this;
    }

    initializeNotFoundResponse() {
        this.app.use((req, res) => {
            res.status(404).send({
                success: false, message: 'Not found!'
            })
        });
        return this;
    }

    initializeErrorHandler() {
        const { ValidationError, UnauthorizedError } = require('./errors');
        const { getMessage } = require('./facades');
        const errors = [{
            field: 'general', message: getMessage('error.general')
        }]
        this.app.use((err, req, res, next) => {
            console.log(err);
            if (err instanceof ValidationError) {
                return res.status(400).send({
                    success: false, message: err.message,
                    errors: err.errors.length ? err.errors : errors
                });
            } else if (err instanceof UnauthorizedError) {
                return res.status(401).send({
                    success: false, message: err.message, errors
                });
            }
            else {
                return res.status(500).send({
                    success: false, message: err.message, errors
                });
            }
        });
        return this;
    }

    allowCrossOriginResourceSharing() {
        const allowedOrigins = this.config.cors.origins || null;
        const allowedHeaders = this.config.cors.headers || [];
        const corsOptions = { allowedHeaders, origin: '*' };

        if (Array.isArray(allowedOrigins)) {
            corsOptions.origin = (origin, callback) => {
                if (process.env['NODE_ENV'] !== 'production') {
                    callback(null, true);
                } else if (allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else { callback(new Error('Not allowed by CORS')); }
            }
        }

        this.app.use(require('cors')(corsOptions));
        return this;
    }

    startupDatabases() {
        const connections = require('./databases');

        process.once('SIGUSR2', function () {
            for (const connection in connections) {
                console.log(`Closing ${connection} database...`);
                connections[connection].close();
            }
            setTimeout(() => {
                process.kill(process.pid, 'SIGUSR2');
            }, 1000);
        });

        return this;
    }

    boot() {
        this.instance.listen(this.config.port, () => {
            console.log(
                `Listening on the port: ${this.config.port}`
            );
        });
    }
}

(() => {
    new Server()
        .initializeBodyParser()
        .allowCrossOriginResourceSharing()
        .initializeRoutes()
        .initializeStaticPath()
        .initializeNotFoundResponse()
        .initializeErrorHandler()
        .startupDatabases()
        .boot();
})()