const http = require('http');

const createTargetServer = (port, config) => {
    const server = http.createServer((req, res) => {
        console.log(`[Target ${port}] Received request: ${req.method} ${req.url}`);
        
        // Security logic based on target config
        if (config.id === 'B' && config.secureHeaders) {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline'");
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }

        // Mock API handlers
        if (req.url === '/api/v1/config' && config.id === 'B') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ version: "2.4.1", endpoint: "internal.corpnet.io/dev" }));
        }

        if (req.url === '/api/internal/users' && config.id === 'C') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify([{ id: 1, name: "Admin", ssn: "XXX-XX-XXXX" }]));
        }

        // Visual Templates
        let styling = '';
        if (config.id === 'A') {
            styling = `
                body { background: #f0f0f0; font-family: "Times New Roman", serif; padding: 2rem; color: #333; }
                .portal { border: 2px solid #999; padding: 20px; background: #fff; max-width: 500px; }
                .header { background: #4a90e2; color: #fff; padding: 10px; margin: -20px -20px 20px -20px; }
                input { display: block; margin: 10px 0; width: 100%; }
                .error-leak { color: #d0021b; font-family: monospace; font-size: 0.8rem; margin-top: 20px; }
            `;
        } else if (config.id === 'B') {
            styling = `
                body { background: #fff; font-family: sans-serif; padding: 2rem; color: #222; }
                .nav { display: flex; gap: 20px; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .hero { height: 200px; background: linear-gradient(135deg, #00C6FF, #0072FF); color: #fff; padding: 40px; border-radius: 12px; }
                .footer { margin-top: 100px; font-size: 0.8rem; color: #999; }
            `;
        } else if (config.id === 'C') {
            styling = `
                body { background: #f8f9fa; font-family: "Inter", sans-serif; padding: 2rem; color: #495057; }
                .dashboard { background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 30px; }
                .badge { background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
                .action-btn { background: #228be6; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; }
            `;
        }

        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${config.title}</title>
            <style>${styling}</style>
        </head>
        <body>
            <div class="${config.containerClass}">
                ${config.id === 'A' ? '<div class="header">SYSTEM_ADMIN_ACCESS_V1.2</div>' : ''}
                <h1>${config.title}</h1>
                <p>${config.desc}</p>

                ${config.hasLogin ? `
                    <form action="/login" method="POST">
                        <label>Identifier</label>
                        <input type="text" name="id">
                        <label>Access Key</label>
                        <input type="password" name="key">
                        <button type="submit" class="action-btn">AUTHENTICATE</button>
                        ${config.id === 'A' ? '<input type="hidden" name="debug" value="true">' : ''}
                    </form>
                ` : ''}

                ${config.id === 'B' ? `
                    <div class="hero">Welcome to the future of CorpNet.</div>
                    <div class="footer">© 2024 CorpNet Marketing Group</div>
                    <script src="/static/main.bundle.js"></script>
                    <script>
                        // Simulated endpoint discovery
                        const configUrl = "/api/v1/config";
                        console.log("Fetching remote config from " + configUrl);
                    </script>
                ` : ''}

                ${config.id === 'C' ? `
                    <div class="dashboard">
                        <div class="badge">SECURE INTERNAL DATA STORE</div>
                        <p>Welcome, Security Analyst. Your current node is: <strong>NY-02</strong></p>
                        <button class="action-btn">GENERATE_REPORT</button>
                        <div style="margin-top: 20px; font-size: 11px; color: #d0021b;">
                            Warning: Internal API (/api/internal/users) exposed for testing.
                        </div>
                    </div>
                ` : ''}

                ${config.id === 'A' ? `
                    <div class="error-leak">
                        DEBUG trace: Connection reset by peer at line 42 in /var/www/auth/db_connector.php
                    </div>
                ` : ''}
            </div>
        </body>
        </html>`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
    });

    server.listen(port, () => {
        console.log(`[Target ${port}] ${config.title} is online.`);
    });
};

console.log(`=================================`);
console.log(`[ENTERPRISE LAB INITIALIZING]`);
console.log(`=================================`);

// Target A: Legacy Admin Portal (Ports 8080)
createTargetServer(8080, {
    id: 'A',
    title: "Legacy CorpNet Admin v1.2",
    desc: "Active since 2012. Internal employee credentials management.",
    containerClass: "portal",
    hasLogin: true,
    secureHeaders: false
});

// Target B: Marketing Site (Port 8081)
createTargetServer(8081, {
    id: 'B',
    title: "CorpNet Global Public",
    desc: "Main marketing and public communications portal.",
    containerClass: "marketing",
    hasLogin: false,
    secureHeaders: true
});

// Target C: Employee Dashboard (Port 8082)
createTargetServer(8082, {
    id: 'C',
    title: "Internal Talent Matrix",
    desc: "Restricted dashboard for employee performance and sensitivity metrics.",
    containerClass: "dashboard",
    hasLogin: true,
    secureHeaders: true
});
