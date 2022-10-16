"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(fastify) {
    fastify.post("/:device_id", async (request, reply) => {
        const { device_id } = request.params;
        const { mobile } = request.body;
        // If incorrect parameters, return 400
        if (!device_id || mobile === undefined) {
            return reply.status(400).send();
        }
        try {
            const { rowCount } = await fastify.pg.query("SELECT * FROM device WHERE id = $1", [
                device_id,
            ]);
            if (rowCount !== 0) {
                return reply.status(409).send();
            }
            await fastify.pg.query("INSERT INTO device (id, mobile) VALUES ($1, $2)", [
                device_id,
                mobile,
            ]);
            return reply.status(201).send();
        }
        catch (error) {
            console.log("Error occurred at POST /api/v1/device/:device_id");
            console.error(error);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
