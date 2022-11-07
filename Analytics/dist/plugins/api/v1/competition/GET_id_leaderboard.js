"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(fastify) {
    fastify.get("/:id/leaderboard", async (request, reply) => {
        if (!request.session.authenticated) {
            reply.status(401).send();
            return;
        }
        const { id } = request.params;
        const { page } = request.query;
        if (!id || !page) {
            return reply.status(400).send();
        }
        try {
            // Get the competition start and end date with id from the request
            const { rows: competitions } = await fastify.pg.query("SELECT start_date, end_date FROM competition WHERE id = $1;", [
                request.params.id,
            ]);
            if (competitions.length === 0) {
                return reply.status(404).send();
            }
            const competition = competitions[0];
            // Get the top 10 leaderboard entries for the competition with unique player_ids with pagination
            // the leaderboard entry belongs to the competition if the timestamp of the entry is between the start and end date of the competition
            const { rows } = await fastify.pg.query(`SELECT * FROM
						(SELECT DISTINCT ON (leaderboard.player_id)
							leaderboard.id,
							game.portfolio_value,
							player.name
						FROM leaderboard INNER JOIN game ON leaderboard.game_id = game.id
						INNER JOIN player ON leaderboard.player_id = player.id
						WHERE game.timestamp BETWEEN $1 AND $2
						ORDER BY leaderboard.player_id DESC, game.portfolio_value DESC)t
					ORDER BY portfolio_value DESC
					LIMIT 10 OFFSET $3`, [competition.start_date, competition.end_date, (page - 1) * 10]);
            // Get the total number of rows
            const { rows: countRows } = await fastify.pg.query("SELECT COUNT(DISTINCT leaderboard.player_id) FROM leaderboard INNER JOIN game ON leaderboard.game_id = game.id WHERE game.timestamp BETWEEN $1 AND $2;", [competition.start_date, competition.end_date]);
            const count = countRows[0].count;
            return reply.status(200).send({
                leaderboard: rows,
                pageCount: Math.ceil(count / 10),
            });
        }
        catch (err) {
            console.error(err);
            return reply.status(500).send();
        }
    });
}
exports.default = default_1;
