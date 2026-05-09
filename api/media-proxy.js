const { proxyMedia } = require("../server/mediaProxy");

module.exports = async function handler(req, res) {
    if (req.method !== "GET" && req.method !== "HEAD") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        await proxyMedia(req, res);
    } catch (error) {
        res.status(500).json({
            error: error.message || "Proxy failed",
        });
    }
};
