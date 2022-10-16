"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(fastify) {
    fastify.put("/:id", async (request, reply) => {
        if (!request.session.authenticated) {
            reply.status(401).send();
            return;
        }
        try {
            if (!request.body.title ||
                !request.body.details ||
                !request.body.start_date ||
                !request.body.end_date ||
                !request.params.id) {
                return reply.status(400).send();
            }
            await fastify.pg.query("UPDATE competition SET title = $1, details = $2, start_date = $3, end_date = $4 WHERE id = $5;", [
                request.body.title,
                request.body.details,
                request.body.start_date,
                request.body.end_date,
                request.params.id,
            ]);
            return reply.status(200).send();
        }
        catch (err) {
            console.error(err);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
