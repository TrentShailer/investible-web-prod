"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
async function plugin(fastify, options) {
    fastify.get("/game_count", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            let result = [];
            // Get the number of games played per day
            const { rows: data } = await fastify.pg.query(`SELECT
					DATE(timestamp)::DATE as timestamp,
					COUNT(*)::INT
						FROM game WHERE
							timestamp > CURRENT_DATE - interval '21 day' AND
							turns > 10
								GROUP BY DATE(timestamp);`);
            // Get the days in the last 21 days
            const { rows: blankData } = await fastify.pg.query(`SELECT
					generate_series(CURRENT_DATE - interval '21 day', CURRENT_DATE - interval '1 day', interval '1 day')::DATE as timestamp,
					0 as count;`);
            // Merge the two arrays
            for (const row of blankData) {
                const gameRow = data.find((d) => d.timestamp.toString() === row.timestamp.toString());
                let dateString = (0, date_fns_1.format)(new Date(row.timestamp), "dd MMM");
                result.push({
                    Date: dateString,
                    Games: gameRow?.count ?? 0,
                });
            }
            return res.status(200).send(result);
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
