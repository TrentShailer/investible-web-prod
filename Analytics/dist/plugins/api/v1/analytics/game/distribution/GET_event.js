"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
[
        { name: "Positive", value: 49.7 },
        { name: "Negative", value: 50.3 },
]
 */
async function plugin(fastify, options) {
    fastify.get("/event", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            const { rows } = await fastify.pg.query("SELECT AVG(positive_event_count)::INT as positive_event_count, AVG(negative_event_count)::INT as negative_event_count FROM game WHERE DATE(timestamp) != CURRENT_DATE AND turns > 10;");
            const positiveEventCount = rows[0].positive_event_count ?? 0;
            const negativeEventCount = rows[0].negative_event_count ?? 0;
            const result = [
                {
                    name: "Positive",
                    value: Number(positiveEventCount.toFixed(1)),
                },
                {
                    name: "Negative",
                    value: Number(negativeEventCount.toFixed(1)),
                },
            ];
            return res.status(200).send(result);
        }
        catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
