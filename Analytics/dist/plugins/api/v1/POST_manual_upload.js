"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
async function default_1(fastify) {
    fastify.post("/manual_upload", async (request, reply) => {
        if (!request.session.authenticated) {
            return reply.status(401).send();
        }
        const body = request.body;
        if (!body.displayName ||
            !body.firstName ||
            !body.lastName ||
            !body.email ||
            !body.mobile ||
            !body.portfolioValue) {
            return reply.status(400).send();
        }
        try {
            let player_id;
            let userExists = false;
            // find any existing user with the same email, mobile, or first and last name
            const existingUser = await fastify.pg.query("SELECT player_id FROM player WHERE LOWER(email) = $1 OR LOWER(mobile) = $2 OR (LOWER(first_name) = $3 AND LOWER(last_name) = $4);", [
                body.email.toLowerCase(),
                body.mobile.toLowerCase(),
                body.firstName.toLowerCase(),
                body.lastName.toLowerCase(),
            ]);
            if (existingUser.rowCount > 0) {
                player_id = existingUser.rows[0].player_id;
                userExists = true;
            }
            else {
                // create a new user
                const result = await fastify.pg.query("INSERT INTO player (player_id, first_name, last_name, email, mobile) VALUES ($1, $2, $3, $4, $5) RETURNING player_id;", [(0, uuid_1.v4)(), body.firstName, body.lastName, body.email, body.mobile]);
                player_id = result.rows[0].player_id;
            }
            // Create a new game for the portfolio value
            const game_id = (0, uuid_1.v4)();
            await fastify.pg.query("INSERT INTO game (id, player_id, portfolio_value, game_version) VALUES ($1, $2, $3, $4);", [game_id, player_id, body.portfolioValue, "Manual Entry"]);
            // create new leaderboard entry
            await fastify.pg.query("INSERT INTO leaderboard (id, player_id, game_id) VALUES ($1, $2, $3);", [(0, uuid_1.v4)(), player_id, game_id]);
            return reply.status(200).send({ userExists });
        }
        catch (err) {
            console.error(err);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
