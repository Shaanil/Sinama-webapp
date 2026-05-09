const { scrapeMedia } = require("../server/scrapeMedia");

module.exports = async function handler(req, res) {
    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }

    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const { title, type, seasonNumber, episodeNumber } = req.query;
    const mediaContext = type === "movie" ? `Movie: ${title}` : `Show: ${title} (S${seasonNumber}E${episodeNumber})`;
    
    console.log(`🔍 [Scraper] Initiating fetch for ${mediaContext}`);

    try {
        const result = await scrapeMedia(req.query);
        
        if (result && result.stream) {
            console.log(`✅ [Scraper] Successfully found stream for ${title}`);
        } else {
            console.log(`⚠️ [Scraper] No native stream found for ${title}. Client will fallback to Vidking.`);
        }

        res.setHeader("Cache-Control", "no-store");
        res.status(200).json(result);
    } catch (error) {
        console.log(`❌ [Scraper] Failed to fetch ${title}: ${error.message}. Redirecting to Vidking.`);
        res.status(500).json({
            error: error.message || "Scrape failed",
            details: error.details || [],
        });
    }
};
