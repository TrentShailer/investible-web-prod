"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
async function default_1(fastify) {
    fastify.post("/", async (request, reply) => {
        try {
            const { secret, playerID, gameID } = request.body;
            if (!secret || !playerID || !gameID) {
                return reply.status(400).send();
            }
            if (secret !== process.env.GAME_SECRET) {
                return reply.status(401).send();
            }
            // Ensure game_id exists
            const { rowCount: gameExists } = await fastify.pg.query(`SELECT id FROM game WHERE id = $1;`, [gameID]);
            if (gameExists === 0) {
                console.log("Game does not exist");
                return reply.status(404).send();
            }
            // Ensure player_id exists
            const { rowCount: playerExists } = await fastify.pg.query(`SELECT id FROM player WHERE id = $1;`, [playerID]);
            if (playerExists === 0) {
                console.log("Player does not exist");
                return reply.status(404).send();
            }
            // create new leaderboard entry
            await fastify.pg.query("INSERT INTO leaderboard (id, player_id, game_id, agree_terms) VALUES ($1, $2, $3, $4);", [(0, uuid_1.v4)(), playerID, gameID, true]);
            return reply.status(201).send();
        }
        catch (err) {
            console.log(err);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
