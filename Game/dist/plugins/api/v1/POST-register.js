"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(fastify) {
    fastify.post("/register", async (request, reply) => {
        try {
            const { deviceID, displayName, email, firstName, lastName, mobile, agreeTerms } = request.body;
            if (!deviceID ||
                !displayName ||
                !email ||
                !firstName ||
                !lastName ||
                !mobile ||
                !agreeTerms) {
                return reply.status(400).send();
            }
            const { rowCount: playerExists, rows } = await fastify.pg.query(`SELECT id, name, first_name, last_name, email, mobile FROM player WHERE
				(LOWER(first_name) = $1 AND LOWER(last_name) = $2)
				OR LOWER(email) = $3
				OR mobile = $4;`, [firstName.toLowerCase(), lastName.toLowerCase(), email.toLowerCase(), mobile]);
            const { rows: currentPlayer } = await fastify.pg.query(`SELECT player_id FROM device WHERE id = $1;`, [deviceID]);
            let currentPlayerID = currentPlayer[0]?.player_id;
            if (!currentPlayerID) {
                return reply.status(400).send();
            }
            if (playerExists === 0) {
                // update current player
                await fastify.pg.query(`UPDATE player SET name = $1, first_name = $2, last_name = $3, email = $4, mobile = $5 WHERE id = $6;`, [displayName, firstName, lastName, email, mobile, currentPlayerID]);
                // await fastify.pg.query(
                // 	`INSERT INTO player (id, name, first_name, last_name, email, mobile) VALUES ($1, $2, $3, $4, $5, $6);`,
                // 	[player_id, displayName, firstName, lastName, email, mobile]
                // );
                // update device with player
                // await fastify.pg.query(`UPDATE device SET player_id = $1 WHERE id = $2;`, [
                // 	player_id,
                // 	deviceID,
                // ]);
                return reply.status(200).send({
                    playerID: currentPlayerID,
                    displayName,
                    firstName,
                    lastName,
                    email,
                    mobile,
                    agreeTerms,
                });
            }
            let player = rows[0];
            // update device with player
            await fastify.pg.query(`UPDATE device SET player_id = $1 WHERE id = $2;`, [
                player.id,
                deviceID,
            ]);
            // delete current player
            await fastify.pg.query(`DELETE FROM player WHERE id = $1;`, [currentPlayerID]);
            return reply.status(200).send({
                playerID: player.id,
                displayName: player.name,
                firstName: player.first_name,
                lastName: player.last_name,
                email: player.email,
                mobile: player.mobile,
                agreeTerms,
            });
        }
        catch (err) {
            console.log(err);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
