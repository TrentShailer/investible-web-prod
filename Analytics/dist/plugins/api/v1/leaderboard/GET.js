"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        const { page } = req.query;
        if (!page) {
            return res.status(400).send();
        }
        try {
            // Because the leaderboard holds all historic records, we just want to get the top record for each player
            const { rows } = await fastify.pg.query(`SELECT * FROM
					(SELECT DISTINCT ON (leaderboard.player_id)
						leaderboard.id,
						game.portfolio_value,
						player.name
					FROM leaderboard
					INNER JOIN game ON leaderboard.game_id = game.id
					INNER JOIN player ON leaderboard.player_id = player.id
					ORDER BY leaderboard.player_id DESC
					ORDER BY game.portfolio_value DESC)t
				ORDER BY portfolio_value DESC
				LIMIT 10 OFFSET $1`, [(page - 1) * 10]);
            // Get the total number of rows
            const { rows: countRows } = await fastify.pg.query("SELECT COUNT(DISTINCT leaderboard.player_id) FROM leaderboard;");
            const count = countRows[0].count;
            return res.status(200).send({
                leaderboard: rows,
                pageCount: Math.ceil(count / 10),
            });
        }
        catch (error) {
            console.log("Error in GET /leaderboard");
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
