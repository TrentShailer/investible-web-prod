"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/games", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            const { rows } = await fastify.pg.query(`SELECT
					ROUND(AVG(game_count))::INT as count
					FROM
						(SELECT COUNT(*) as game_count FROM game WHERE GROUP BY player_id)t;`);
            const count = rows[0].count ?? 0;
            return res.status(200).send([{ name: "Average Number of Games", value: count }]);
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
