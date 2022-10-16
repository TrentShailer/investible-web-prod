"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/:id", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).send();
        }
        try {
            // Select all data from the leaderboard
            const { rows } = await fastify.pg.query(`
				SELECT
					leaderboard.id AS leaderboard_id,
					leaderboard.timestamp,
					leaderboard.agree_terms,
					leaderboard.player_id as leaderboard_player_id,
					player.name,
					player.first_name,
					player.last_name,
					player.email,
					player.mobile,
					game.player_id as game_player_id,
					game.game_version,
					game.game_end_reason,
					game.game_time,
					game.positive_event_count,
					game.negative_event_count,
					game.portfolio_value,
					game.insurance_count,
					game.low_risk_count,
					game.high_risk_count,
					game.turns
				FROM leaderboard
				INNER JOIN player ON leaderboard.player_id = player.id
				INNER JOIN game ON leaderboard.game_id = game.id
				WHERE leaderboard.id = $1;
				`, [id]);
            // If no rows are returned, return an error
            if (rows.length === 0) {
                return res.status(404).send();
            }
            // return the leaderboard data
            return res.status(200).send(rows[0]);
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
