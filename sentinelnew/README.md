# SentinelAI: Client-Side Intelligent Vulnerability Simulator

Our system combines browser-level intelligence with agentic AI reasoning to simulate how real attackers would exploit vulnerabilities, rather than just listing them.

## To run this locally:

You will need to run 3 completely separate terminal windows, and then load the extension to your Chrome browser.

### 1. Start the React Dashboard
Open a terminal in the `dashboard` folder:
```bash
cd dashboard
npm install
npm run dev
```

### 2. Start the FastAPI Backend
Open a second terminal in the `backend` folder. You must have Python installed.
```bash
cd backend
pip install fastapi uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Start the Demo Vulnerable Target
Open a third terminal in the `fake-server` folder. You must have Node installed.
```bash
cd fake-server
node server.js
```

### 4. Load the Chrome Extension
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`
3. Turn on the **Developer mode** toggle in the top right.
4. Click **Load unpacked** in the top left.
5. Select the `extension` folder located inside this project directory.

## Running the Simulation

1. Keep the Dashboard tab open (`http://localhost:5173`).
2. Go to the Fake Target Server tab (`http://localhost:8080`).
3. Click the newly installed SentinelAI Scanner extension icon, and click the green **Run Agentic Scan** button.
4. The dashboard will instantly update with live simulation data and an attack path report based on the vulnerabilities detected on the Fake Server.
