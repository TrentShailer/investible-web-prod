"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/contact", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            const { rows } = await fastify.pg.query("SELECT clicked_contact::BOOL, COUNT(*)::INT FROM player GROUP BY clicked_contact;");
            if (rows.length === 0) {
                return res.status(200).send([
                    { name: "Clicked Contact", value: 50 },
                    { name: "Didn't Click Contact", value: 50 },
                ]);
            }
            const total = rows.reduce((acc, row) => acc + row.count, 0);
            const data = rows.map((row) => ({
                name: row.clicked_contact ? "Clicked Contact" : "Didn't Click Contact",
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
