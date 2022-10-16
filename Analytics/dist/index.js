"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const fastify_1 = __importDefault(require("fastify"));
const static_1 = __importDefault(require("@fastify/static"));
const postgres_1 = __importDefault(require("@fastify/postgres"));
const session_1 = __importDefault(require("@fastify/session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const path_1 = __importDefault(require("path"));
const autoload_1 = __importDefault(require("@fastify/autoload"));
const PGStore = (0, connect_pg_simple_1.default)(session_1.default);
const fastify = (0, fastify_1.default)({
    logger: false,
});
fastify.register(cookie_1.default, {});
fastify.register(postgres_1.default, {
    connectionString: process.env.DATABASE_URL,
});
if (process.env.SESSION_SECRET) {
    fastify.register(session_1.default, {
        cookie: {
            maxAge: 1000 * 60 * 60 * 1,
            secure: process.env.DEV ? false : true,
        },
        secret: process.env.SESSION_SECRET,
        rolling: true,
        store: new PGStore({
            conString: process.env.DATABASE_URL,
        }),
    });
}
else {
    console.error("Session secret not found");
    process.exit(1);
}
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, "frontend"),
});
fastify.get("/", async (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect("/login");
    }
    return res.sendFile("index.html", path_1.default.join(__dirname, "frontend"));
});
fastify.get("/login", async (req, res) => {
    if (req.session.authenticated) {
        return res.redirect("/");
    }
    return res.sendFile("index.html", path_1.default.join(__dirname, "frontend"));
});
fastify.register(autoload_1.default, { dir: path_1.default.join(__dirname, "plugins") });
// Start Server
fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
