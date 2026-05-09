const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
    app.use(
        createProxyMiddleware({
            pathFilter: "/api",
            target: process.env.REACT_APP_API_URL || "http://localhost:5001",
            changeOrigin: true,
        }),
    );
};
