"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(fastify) {
    fastify.get("/", async (request, reply) => {
        // get if there is a current competition
        const { rows: competitionRows } = await fastify.pg.query("SELECT id, start_date, end_date FROM competition WHERE end_date > NOW() AND start_date < NOW() ORDER BY start_date ASC LIMIT 1;");
        if (competitionRows.length === 0) {
            // no competition just top 10
            const { rows } = await fastify.pg.query(`SELECT * FROM
					(SELECT DISTINCT ON (leaderboard.player_id)
						leaderboard.id,
						game.portfolio_value,
						player.name
					FROM leaderboard
					INNER JOIN game ON leaderboard.game_id = game.id
					INNER JOIN player ON leaderboard.player_id = player.id
					ORDER BY leaderboard.player_id DESC, game.portfolio_value DESC)t
				ORDER BY portfolio_value DESC
				LIMIT 10`);
            return reply.status(200).send(rows);
        }
        else {
            const competition = competitionRows[0];
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
				LIMIT 10`, [competition.start_date, competition.end_date]);
            return reply.status(200).send(rows);
        }
    });
}
exports.default = default_1;
