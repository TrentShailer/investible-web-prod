"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
async function default_1(fastify) {
    fastify.post("/", async (request, reply) => {
        const { clicked_contact, device_id } = request.body;
        if (clicked_contact === undefined || !device_id) {
            return reply.status(400).send();
        }
        try {
            const { rows, rowCount } = await fastify.pg.query("SELECT player_id FROM device WHERE id = $1", [device_id]);
            if (rowCount === 0) {
                return reply.status(404).send();
            }
            let player_id = rows[0].player_id;
            if (player_id === null) {
                // player_id is null, so we need to create a new player
                player_id = (0, uuid_1.v4)();
                await fastify.pg.query("INSERT INTO player (id, clicked_contact) VALUES ($1, $2);", [player_id, clicked_contact]);
                // Update device with player_id
                await fastify.pg.query("UPDATE device SET player_id = $1 WHERE id = $2;", [
                    player_id,
                    device_id,
                ]);
                return reply.status(201).send();
            }
            else {
                // player_id is not null, so we need to update the player
                await fastify.pg.query("UPDATE player SET clicked_contact = $1 WHERE id = $2;", [
                    clicked_contact,
                    player_id,
                ]);
                return reply.status(200).send();
            }
        }
        catch (error) {
            console.log("Error occurred at POST /api/v1/player");
            console.error(error);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
