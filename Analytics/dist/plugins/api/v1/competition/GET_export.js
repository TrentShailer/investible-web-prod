"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/:id/export", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).send();
        }
        try {
            // Find the start and end dates for the competition
            const { rows: competitionRows } = await fastify.pg.query(`SELECT start_date, end_date FROM competition WHERE id = $1;`, [id]);
            if (competitionRows.length === 0) {
                return res.status(404).send();
            }
            const { start_date, end_date } = competitionRows[0];
            // Get the leaderboard entries for the competition with unique player_ids
            const { rows: leaderboardIds } = await fastify.pg.query(`SELECT DISTINCT ON (leaderboard.player_id)
					leaderboard.id
				FROM leaderboard
				INNER JOIN game ON leaderboard.game_id = game.id
				INNER JOIN player ON leaderboard.player_id = player.id
				WHERE game.timestamp BETWEEN $1 AND $2
				ORDER BY leaderboard.player_id DESC;`, [start_date, end_date]);
            const { rows: leaderboardRows } = await fastify.pg.query(`
				SELECT * FROM
					(SELECT
						leaderboard.id AS leaderboard_id,
						leaderboard.timestamp,
						leaderboard.agree_terms,
						leaderboard.player_id AS leaderboard_player_id,
						player.name,
						player.first_name,
						player.last_name,
						player.email,
						player.mobile,
						game.player_id AS game_player_id,
						game.game_version AS version,
						game_time,
						game.portfolio_value,
						game.turns
					FROM leaderboard
					INNER JOIN game ON leaderboard.game_id = game.id
					INNER JOIN player ON leaderboard.player_id = player.id
					WHERE leaderboard.id IN (${leaderboardIds.map((_, i) => `$${i + 1}`).join(", ")})
					ORDER BY leaderboard.id DESC)t
				ORDER BY portfolio_value DESC;
			`, leaderboardIds.map(({ id }) => id));
            let csv = "leaderboard_id,timestamp,agree_terms,leaderboard_player_id,game_player_id,name,first_name,last_name,email,mobile,version,game_time,portfolio_value,turns\r";
            // Convert the data to CSV
            for (const row of leaderboardRows) {
                csv += `${row.leaderboard_id},${row.timestamp},${row.agree_terms},${row.leaderboard_player_id},${row.game_player_id},"${row.name}","${row.first_name}","${row.last_name}","${row.email}","${row.mobile}",${row.version},${row.game_time},${row.portfolio_value},${row.turns}\r`;
            }
            // Send the CSV file
            res.header("Content-Type", "text/csv");
            res.header("Content-Disposition", `attachment; filename="competition-${id}.csv"`);
            return res.send(csv);
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
