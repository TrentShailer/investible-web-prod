"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = require("argon2");
async function plugin(fastify, options) {
    fastify.post("/login", async (req, res) => {
        if (process.env.ANALYTICS_PASSWORD_HASH) {
            const { password } = req.body;
            if (!password) {
                return res.status(400).send();
            }
            if (await (0, argon2_1.verify)(process.env.ANALYTICS_PASSWORD_HASH, password)) {
                req.session.authenticated = true;
                return res.status(200).send();
            }
            return res.status(401).send();
        }
        return res.status(500).send();
    });
}
exports.default = plugin;
