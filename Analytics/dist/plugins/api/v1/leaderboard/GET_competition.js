"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/competition", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        const { page } = req.query;
        if (!page) {
            return res.status(400).send();
        }
        try {
            const { rows: competitionRows } = await fastify.pg.query("SELECT id, start_date, end_date FROM competition WHERE end_date > NOW() AND start_date < NOW() ORDER BY start_date ASC LIMIT 1;");
            if (competitionRows.length === 0) {
                return res.status(404).send();
            }
            const competition = competitionRows[0];
            // Get the top 10 leaderboard entries for the competition with unique player_ids with pagination
            // the leaderboard entry belongs to the competition if the timestamp of the entry is between the start and end date of the competition
            const { rows } = await fastify.pg.query(`SELECT * FROM
					(SELECT DISTINCT ON (leaderboard.player_id)
						leaderboard.id,
						game.portfolio_value,
						player.name
					FROM leaderboard
					INNER JOIN game ON leaderboard.game_id = game.id
					INNER JOIN player ON leaderboard.player_id = player.id
					WHERE game.timestamp BETWEEN $1 AND $2
					ORDER BY leaderboard.player_id DESC, game.portfolio_value DESC)t
				ORDER BY portfolio_value DESC
				LIMIT 10 OFFSET $3`, [competition.start_date, competition.end_date, (page - 1) * 10]);
            // Get the total number of rows
            const { rows: countRows } = await fastify.pg.query("SELECT COUNT(DISTINCT leaderboard.player_id) FROM leaderboard INNER JOIN game ON leaderboard.game_id = game.id WHERE game.timestamp BETWEEN $1 AND $2;", [competition.start_date, competition.end_date]);
            const count = countRows[0].count;
            return res.status(200).send({
                leaderboard: rows,
                pageCount: Math.ceil(count / 10),
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
