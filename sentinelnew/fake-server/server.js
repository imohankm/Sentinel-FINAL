const http = require('http');

const PORT = 8080;

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CorpNet Internal Portal</title>
    <style>
        body { font-family: Arial; background-color: #f0f2f5; margin: 0; padding: 2rem; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .login-box { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        h1 { color: #1a73e8; margin-top: 0; text-align: center; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; color: #5f6368; }
        input { width: 100%; padding: 0.75rem; border: 1px solid #dadce0; border-radius: 4px; box-sizing: border-box; }
        button { background: #1a73e8; color: white; border: none; padding: 0.75rem; width: 100%; border-radius: 4px; font-weight: bold; cursor: pointer; }
        button:hover { background: #1557b0; }
        .alert { background: #fee; color: #c00; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem; text-align: center; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>CorpNet Admin</h1>
        <div class="alert">
            <strong>Warning:</strong> This portal is accessible via external IP. Please configure firewall rules immediately.
        </div>
        <div class="form-group">
            <label>Username</label>
            <input type="text" placeholder="admin" value="admin" readonly>
        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" placeholder="admin" value="admin" readonly>
        </div>
        <button type="button" onclick="alert('Login disabled for demo')">Login (Default Creds Active)</button>
        
        <p style="text-align: center; margin-top: 2rem; color: #888; font-size: 0.8rem;">Vulnerable Endpoint Demo - SentinelAI Target</p>
    </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    console.log(`[Fake Server] Received request: ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
});

server.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`[VULNERABLE TARGET INITIALIZED]`);
    console.log(`Running on http://localhost:${PORT}`);
    console.log(`Waiting for incoming connections...`);
    console.log(`=================================`);
});
