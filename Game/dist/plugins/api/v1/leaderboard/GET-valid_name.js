"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ValidateName_1 = __importDefault(require("../../../../utils/ValidateName"));
async function plugin(fastify, options) {
    fastify.get("/valid_name", async (req, res) => {
        let name = req.query.name;
        try {
            return res.status(200).send((0, ValidateName_1.default)(name));
        }
        catch (error) {
            console.log("Error occurred at GET /api/v1/leaderboard/valid_name");
            console.error(error);
            return res.status(500).send();
        }
    });
}
exports.default = plugin;
