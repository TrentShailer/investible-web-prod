"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    // Returns the distribution of blocks used by all players and top players as a percentage
    fastify.get("/block_distribution", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            const { rows: allPlayersRows } = await fastify.pg.query(`SELECT
					ROUND(AVG(low_risk_count))::INT AS low_risk,
					ROUND(AVG(high_risk_count))::INT AS high_risk,
					ROUND(AVG(insurance_count))::INT AS insurance
					FROM game WHERE DATE(timestamp) != CURRENT_DATE AND turns > 10;`);
            const { rows: topPlayersRows } = await fastify.pg.query(`SELECT
					ROUND(AVG(low_risk_count))::INT AS low_risk,
					ROUND(AVG(high_risk_count))::INT AS high_risk,
					ROUND(AVG(insurance_count))::INT AS insurance
					FROM
						(SELECT
							low_risk_count,
							high_risk_count,
							insurance_count
							FROM game WHERE DATE(timestamp) != CURRENT_DATE AND turns > 10
							ORDER BY portfolio_value DESC
							LIMIT (SELECT COUNT(*) FROM game WHERE DATE(timestamp) != CURRENT_DATE AND turns > 10) / 10
							) AS top_players;`);
            if (allPlayersRows.length === 0 || topPlayersRows.length === 0) {
                return res.status(200).send([
                    {
                        label: "Low Risk",
                        allPlayers: 0,
                        topPlayers: 0,
                    },
                    {
                        label: "High Risk",
                        allPlayers: 0,
                        topPlayers: 0,
                    },
                    {
                        label: "Insurance",
                        allPlayers: 0,
                        topPlayers: 0,
                    },
                ]);
            }
            const allPlayers = allPlayersRows[0];
            const topPlayers = topPlayersRows[0];
            const allPlayersTotal = allPlayers.low_risk + allPlayers.high_risk + allPlayers.insurance;
            const topPlayersTotal = topPlayers.low_risk + topPlayers.high_risk + topPlayers.insurance;
            const data = [
                {
                    label: "Low Risk",
                    allPlayers: Number(((allPlayers.low_risk / allPlayersTotal) * 100).toFixed(1)),
                    topPlayers: Number(((topPlayers.low_risk / topPlayersTotal) * 100).toFixed(1)),
                },
                {
                    label: "High Risk",
                    allPlayers: Number(((allPlayers.high_risk / allPlayersTotal) * 100).toFixed(1)),
                    topPlayers: Number(((topPlayers.high_risk / topPlayersTotal) * 100).toFixed(1)),
                },
                {
                    label: "Insurance",
                    allPlayers: Number(((allPlayers.insurance / allPlayersTotal) * 100).toFixed(1)),
                    topPlayers: Number(((topPlayers.insurance / topPlayersTotal) * 100).toFixed(1)),
                },
            ];
            return res.status(200).send(data);
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
