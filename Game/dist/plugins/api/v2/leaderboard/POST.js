"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
async function default_1(fastify) {
    fastify.post("/", async (request, reply) => {
        try {
            const { secret, gameID, deviceID } = request.body;
            let playerID = request.body.deviceID;
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
                // ensure device_id exists
                const { rowCount: deviceExists } = await fastify.pg.query(`SELECT id FROM device WHERE id = $1;`, [deviceID]);
                if (deviceExists === 0) {
                    console.log("Device does not exist");
                    return reply.status(404).send();
                }
                // get player id from device
                const { rows: currentPlayer } = await fastify.pg.query(`SELECT player_id FROM device WHERE id = $1;`, [deviceID]);
                // if device is not associated with a player return 404
                if (!currentPlayer[0].player_id) {
                    const { email, first_name, last_name, mobile, displayName } = request.body;
                    // Check if a player with the same email, full name, or mobile number exists
                    const { rowCount: playerExists, rows: playerRows } = await fastify.pg.query(`SELECT id FROM player WHERE email = $1 OR (first_name = $2 AND last_name = $3) OR mobile = $4;`, [email, first_name, last_name, mobile]);
                    // if a player exists, associate the device with the player
                    if (playerExists > 0) {
                        await fastify.pg.query(`UPDATE device SET player_id = $1 WHERE id = $2;`, [
                            playerRows[0].id,
                            deviceID,
                        ]);
                        playerID = playerRows[0].id;
                    }
                    // if a player does not exist, create a new player
                    else {
                        playerID = (0, uuid_1.v4)();
                        await fastify.pg.query(`INSERT INTO player (id, first_name, last_name, email, mobile, display_name) VALUES ($1, $2, $3, $4, $5, $6);`, [playerID, first_name, last_name, email, mobile, displayName]);
                        await fastify.pg.query(`UPDATE device SET player_id = $1 WHERE id = $2;`, [
                            playerID,
                            deviceID,
                        ]);
                    }
                }
                else {
                    // use the player id from the device
                    playerID = currentPlayer[0].player_id;
                }
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
