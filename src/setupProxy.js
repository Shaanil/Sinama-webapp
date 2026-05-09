const { scrapeMedia } = require("../server/scrapeMedia");
const { proxyMedia } = require("../server/mediaProxy");

module.exports = function setupProxy(app) {
    app.get("/api/scrape", async (req, res) => {
        try {
            const result = await scrapeMedia(req.query);
            res.setHeader("Cache-Control", "no-store");
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                error: error.message || "Scrape failed",
                details: error.details || [],
            });
        }
    });

    app.get("/api/media-proxy", async (req, res) => {
        try {
            await proxyMedia(req, res);
        } catch (error) {
            res.status(500).json({
                error: error.message || "Proxy failed",
            });
        }
    });
};
