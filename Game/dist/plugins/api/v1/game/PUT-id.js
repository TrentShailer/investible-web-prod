"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.put("/:game_id", async (req, res) => {
        const { game_id } = req.params;
        const { game_secret, device_id, game_version, game_end_reason, game_time, positive_event_count, negative_event_count, portfolio_value, insurance_count, low_risk_count, high_risk_count, turns, } = req.body;
        // If the game_secret is not valid, return an error
        if (!game_secret || game_secret !== process.env.GAME_SECRET) {
            return res.status(401).send();
        }
        // If the device_id is not valid, return an error
        if (!device_id) {
            return res.status(400).send();
        }
        try {
            // check if game exists
            const { rowCount } = await fastify.pg.query("SELECT * FROM game WHERE id = $1", [
                game_id,
            ]);
            // if device_id has a player associated with it, get it
            const { rows: playerRows } = await fastify.pg.query("SELECT player_id FROM device WHERE id = $1", [device_id]);
            const player_id = playerRows[0]?.player_id ?? null;
            // If game exists, update it
            if (rowCount !== 0) {
                await fastify.pg.query("UPDATE game SET game_version = $1, game_end_reason = $2, game_time = $3, positive_event_count = $4, negative_event_count = $5, portfolio_value = $6, insurance_count = $7, low_risk_count = $8, high_risk_count = $9, turns = $10, player_id = $11 WHERE id = $12", [
                    game_version,
                    game_end_reason,
                    game_time,
                    positive_event_count,
                    negative_event_count,
                    portfolio_value,
                    insurance_count,
                    low_risk_count,
                    high_risk_count,
                    turns,
                    player_id,
                    game_id,
                ]);
                return res.status(200).send();
            }
            // If game does not exist, create it
            await fastify.pg.query("INSERT INTO game (id, game_version, game_end_reason, game_time, positive_event_count, negative_event_count, portfolio_value, insurance_count, low_risk_count, high_risk_count, turns, player_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)", [
                game_id,
                game_version,
                game_end_reason,
                game_time,
                positive_event_count,
                negative_event_count,
                portfolio_value,
                insurance_count,
                low_risk_count,
                high_risk_count,
                turns,
                player_id,
            ]);
            return res.status(201).send();
        }
        catch (err) {
            console.log("Error in PUT /api/v1/game/:game_id");
            console.error(err);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
