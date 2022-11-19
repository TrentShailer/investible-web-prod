"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/end_reason", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            const { rows } = await fastify.pg.query("SELECT game_end_reason::INT, COUNT(*)::INT FROM game WHERE turns > 10 AND DATE(timestamp) != CURRENT_DATE GROUP BY game_end_reason ORDER BY game_end_reason ASC;");
            if (rows.length === 0) {
                return res.status(200).send([
                    { name: "Unstable", value: 25 },
                    { name: "Bankrupt", value: 25 },
                    { name: "Quit to Main Menu", value: 25 },
                    { name: "Gave Up", value: 25 },
                ]);
            }
            const total = rows.reduce((acc, row) => acc + row.count, 0);
            const data = rows.map((row) => ({
                name: ["Unstable", "Bankrupt", "Quit to Main Menu", "Gave Up"][row.game_end_reason],
                value: Number(((row.count / total) * 100).toFixed(1)),
            }));
            return res.status(200).send(data);
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
