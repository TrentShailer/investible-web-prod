"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.delete("/:id", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            await fastify.pg.query("DELETE FROM leaderboard WHERE id = $1;", [req.params.id]);
            return res.status(200).send();
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
