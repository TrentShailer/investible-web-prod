"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
async function default_1(fastify) {
    fastify.post("/create", async (request, reply) => {
        if (!request.session.authenticated) {
            reply.status(401).send();
            return;
        }
        try {
            if (!request.body.title ||
                !request.body.details ||
                !request.body.start_date ||
                !request.body.end_date) {
                return reply.status(400).send();
            }
            await fastify.pg.query("INSERT INTO competition (id, title, details, start_date, end_date) VALUES ($1, $2, $3, $4, $5);", [
                (0, uuid_1.v4)(),
                request.body.title,
                request.body.details,
                request.body.start_date,
                request.body.end_date,
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
