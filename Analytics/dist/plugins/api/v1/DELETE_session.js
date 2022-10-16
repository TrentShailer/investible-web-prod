"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.delete("/session", async (req, res) => {
        req.session.authenticated = false;
        return res.status(200).send();
    });
}
exports.default = plugin;
