const express = require("express");
const cors = require("cors");
const scrapeHandler = require("./api/scrape");
const mediaProxyHandler = require("./api/media-proxy");

const app = express();
const isDevelopment = process.env.NODE_ENV !== "production";

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

if (isDevelopment) {
    app.use((req, res, next) => {
        const startedAt = process.hrtime.bigint();
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userIdentifier = ip === "::1" || ip === "127.0.0.1" ? "Localhost" : ip;
        
        const displayUrl = req.originalUrl || req.url;
        const isMediaProxy = displayUrl.includes("media-proxy");

        // Quiet Mode: Don't log repetitive media segments to keep the console clean
        if (!isMediaProxy) {
            console.log(`[${userIdentifier}] -> ${req.method} ${displayUrl}`);
        }
        
        res.on("finish", () => {
            const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
            const isSuccess = res.statusCode === 200 || res.statusCode === 206;

            if (!isMediaProxy || !isSuccess) {
                console.log(
                    `[${userIdentifier}] <- ${req.method} ${res.statusCode} (${durationMs.toFixed(1)}ms)`,
                );
            }
        });

        next();
    });
}

// Forward requests mapped identical to Vercel routing
app.get("/api/ping", (req, res) => {
    console.log("👋 [Backend] Received ping - Server is awake and ready!");
    res.json({ status: "ok", message: "Sinama Backend is alive" });
});

app.get("/api/scrape", scrapeHandler);
app.get("/api/media-proxy", mediaProxyHandler);
app.head("/api/media-proxy", mediaProxyHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 [Backend] Express server autonomously running on port ${PORT}`);
    console.log(`🔗 [API] Mapped route http://localhost:${PORT}/api/scrape to scraper function`);
});
