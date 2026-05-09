const express = require("express");
const cors = require("cors");
const scrapeHandler = require("./api/scrape");
const mediaProxyHandler = require("./api/media-proxy");

const app = express();

const corsOptions = {
    origin: true,
    methods: ["GET", "HEAD", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    exposedHeaders: [
        "Accept-Ranges",
        "Content-Length",
        "Content-Range",
        "Content-Type",
    ],
    credentials: false,
    optionsSuccessStatus: 204,
};

// Standard middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Forward requests mapped identical to Vercel routing
app.get("/api/scrape", scrapeHandler);
app.get("/api/media-proxy", mediaProxyHandler);
app.head("/api/media-proxy", mediaProxyHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 [Backend] Express server autonomously running on port ${PORT}`);
    console.log(`🔗 [API] Mapped route http://localhost:${PORT}/api/scrape to scraper function`);
});
