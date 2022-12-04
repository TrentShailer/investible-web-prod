"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const fastify_1 = __importDefault(require("fastify"));
const static_1 = __importDefault(require("@fastify/static"));
const postgres_1 = __importDefault(require("@fastify/postgres"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const autoload_1 = __importDefault(require("@fastify/autoload"));
const cors_1 = __importDefault(require("@fastify/cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fastify = (0, fastify_1.default)({
    logger: false,
});
// Setup plugins
fastify.register(formbody_1.default);
fastify.register(postgres_1.default, {
    connectionString: process.env.DATABASE_URL,
});
fastify.register(cors_1.default, {
    origin: "https://investible.ippfa.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
});
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, "frontend"),
    preCompressed: true,
    setHeaders: (res, path, stat) => {
        if (path.includes(".br"))
            res.setHeader("Content-Encoding", "br");
        if (path.includes("wasm"))
            res.setHeader("Content-Type", "application/wasm");
    },
});
fastify.register(autoload_1.default, { dir: path_1.default.join(__dirname, "plugins") });
// Start Server
fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    // if file "fixed_constraint" doesn't exist, create it
    if (!fs_1.default.existsSync("fixed_constraint")) {
        fs_1.default.writeFileSync("fixed_constraint", "true");
        fix_constraint();
    }
});
async function fix_constraint() {
    await fastify.pg.query(`ALTER TABLE device DROP CONSTRAINT device_player_id_fkey, ADD CONSTRAINT device_player_id_fkey FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE SET NULL;`);
}
