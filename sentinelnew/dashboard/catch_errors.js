import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('\n--- BROWSER ERROR ---\n', msg.text(), '\n----------------------\n');
            }
        });
        page.on('pageerror', error => console.log('\n--- PAGE ERROR ---\n', error.message, error.stack, '\n-------------------\n'));

        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        
        // 1. Enable extension
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(b => b.textContent.includes('Enable AI Extension'));
            if (btn) btn.click();
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        // 2. Run scan
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(b => b.textContent.includes('RUN AGENTIC SCAN'));
            if (btn) btn.click();
        });
        
        console.log('Scan started. Waiting 18 seconds for completion rendering...');
        await new Promise(r => setTimeout(r, 18000));
        
        console.log('Finished waiting. Checking if we caught any errors.');
        
        await browser.close();
    } catch (e) {
        console.error('Puppeteer Script Error:', e);
    }
})();
