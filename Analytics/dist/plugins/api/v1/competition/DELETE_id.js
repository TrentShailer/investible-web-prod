"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(fastify) {
    fastify.delete("/:id", async (request, reply) => {
        if (!request.session.authenticated) {
            reply.status(401).send();
            return;
        }
        try {
            await fastify.pg.query("DELETE FROM competition WHERE id = $1;", [request.params.id]);
            return reply.status(200).send();
        }
        catch (err) {
            console.error(err);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
