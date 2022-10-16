"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/authenticated", async (req, res) => {
        if (req.session.authenticated) {
            return res.status(200).send();
        }
        return res.status(401).send();
    });
}
exports.default = plugin;
