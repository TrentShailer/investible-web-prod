"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function plugin(fastify, options) {
    fastify.get("/turns", async (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).send();
        }
        try {
            /* const { rows: binSizeRows } = await fastify.pg.query<{ bin_size: number | null }>(
                "SELECT ROUND(STDDEV(turns)/4)::INT AS bin_size FROM game WHERE turns > 10 AND DATE(timestamp) != CURRENT_DATE;"
            ); */
            const { rows: binSizeRows } = await fastify.pg.query("SELECT ROUND(STDDEV(turns)/4)::INT AS bin_size FROM game WHERE turns > 10 AND DATE(timestamp) != CURRENT_DATE AND turns < 5 * (SELECT AVG(turns) FROM game WHERE turns > 10 AND DATE(timestamp) != CURRENT_DATE);");
            let binSize = Number((binSizeRows[0].bin_size ?? 1).toPrecision(2));
            if (binSize < 1)
                binSize = 1;
            const { rows: data } = await fastify.pg.query(`SELECT FLOOR(turns/${binSize})*${binSize}::INT AS bin_floor, count(*)::INT FROM game WHERE turns > 10 AND DATE(timestamp) != CURRENT_DATE GROUP BY 1 ORDER BY 1;`);
            const { rows: blankData, rowCount } = await fastify.pg.query(`SELECT generate_series(
					${data[0]?.bin_floor ?? 0}, ${data[data.length - 1]?.bin_floor ?? 0}, ${binSize}
					) as bin_floor, 0 as count;`);
            let result = [];
            for (let i = 0; i < rowCount; i++) {
                const binFloor = blankData[i].bin_floor;
                const count = data.find((d) => d.bin_floor === binFloor)?.count ?? 0;
                result.push({ range: `${binFloor}-${binFloor + binSize}`, count });
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
