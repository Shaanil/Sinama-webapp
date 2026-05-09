const { scrapeMedia } = require("../server/scrapeMedia");

module.exports = async function handler(req, res) {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

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
};
