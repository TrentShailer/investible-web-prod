"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_tz_1 = require("date-fns-tz");
async function plugin(fastify, options) {
    fastify.get("/", async (req, res) => {
        try {
            const result = await fastify.pg.query("SELECT title, start_date, end_date, details FROM competition WHERE CURRENT_TIMESTAMP > start_date AND CURRENT_TIMESTAMP < end_date;");
            if (result.rowCount === 0) {
                return res.status(404).send();
            }
            else {
                let row = result.rows[0];
                let start_date = (0, date_fns_tz_1.formatInTimeZone)(row.start_date, "Asia/Singapore", "haaa, do MMM yyyy") +
                    " SGT";
                let end_date = (0, date_fns_tz_1.formatInTimeZone)(row.end_date, "Asia/Singapore", "haaa, do MMM yyyy") + " SGT";
                return res
                    .status(200)
                    .send({ start_date, end_date, details: row.details, title: row.title });
            }
        }
        catch (error) {
            console.log("Error occurred at GET /api/v1/competition");
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
