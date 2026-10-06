import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('screenshots');
const ARTIFACT_DIR = 'C:\\Users\\Acer AL\\.gemini\\antigravity-ide\\brain\\8217cc20-1402-42ad-a9e5-1fcf5509503c';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  
  // Set mobile device emulation (iPhone 15 Pro / standard modern smartphone)
  await page.setViewport({
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const saveScreen = async (filename, label) => {
    const localPath = path.join(OUTPUT_DIR, filename);
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: localPath, type: 'png' });
    try {
      fs.copyFileSync(localPath, artifactPath);
    } catch (e) {
      console.warn('Failed to copy to artifact dir:', e.message);
    }
    console.log(`Captured: ${label} -> ${localPath}`);
  };

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);

    // 1. Patient Live Queue (Top View)
    await saveScreen('01_patient_live_queue.png', '01 - Patient Live Queue & Active Token');

    // 2. Patient Doctors Directory (Scrolled down)
    await page.evaluate(() => {
      window.scrollTo({ top: 620, behavior: 'instant' });
    });
    await sleep(600);
    await saveScreen('02_patient_doctors_directory.png', '02 - Patient Doctors Directory & Specialist OPDs');

    // 3. Digital QR Pass Modal
    // Scroll back up and click on "View Pass" or bottom QR pass button
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await sleep(400);

    // Look for View QR Pass button or click it
    const qrPassBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('QR Pass') || b.innerText.includes('View Pass') || b.innerText.includes('Digital Pass'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    await sleep(800);
    await saveScreen('03_digital_qr_token_pass.png', '03 - Digital QR Token Pass Modal');

    // Close the QR Pass modal
    await page.evaluate(() => {
      // Find close button in modal or backdrop
      const closeBtn = document.querySelector('button[aria-label="Close"]') || 
                       document.querySelector('.fixed button') ||
                       Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('✕') || b.innerText.includes('Close') || b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(600);

    // 4. Book Token Modal
    // Click on the first "Book Token" button under doctors
    await page.evaluate(() => {
      window.scrollTo({ top: 500, behavior: 'instant' });
      const btns = Array.from(document.querySelectorAll('button'));
      const bookBtn = btns.find(b => b.innerText.includes('Book Token'));
      if (bookBtn) bookBtn.click();
    });
    await sleep(800);
    await saveScreen('04_book_token_modal.png', '04 - Book Token Modal Flow');

    // Close booking modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed button') ||
                       Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cancel') || b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(600);

    // 5. Health Hub Tab
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const tabs = Array.from(document.querySelectorAll('button'));
      const healthTab = tabs.find(b => b.innerText.includes('Health Hub'));
      if (healthTab) healthTab.click();
    });
    await sleep(800);
    await saveScreen('05_health_hub_overview.png', '05 - Health Hub Dashboard & Vitals');

    // 6. Health Hub AI & Symptom Checker (Scrolled down)
    await page.evaluate(() => {
      window.scrollTo({ top: 500, behavior: 'instant' });
    });
    await sleep(600);
    await saveScreen('06_health_hub_ai_symptom.png', '06 - Health Hub AI Symptom Checker & Records');

    // 7. Doctor Admin View (OPD Consultation Console)
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Switch navbar or mode to Doctor
      const btns = Array.from(document.querySelectorAll('button'));
      const docBtn = btns.find(b => b.innerText.includes('Doctor') || b.title?.includes('Doctor'));
      if (docBtn) docBtn.click();
    });
    await sleep(800);
    await saveScreen('07_doctor_console_active.png', '07 - Doctor OPD Console & Current Serving Patient');

    // 8. Doctor Admin View (Queue Management scrolled)
    await page.evaluate(() => {
      window.scrollTo({ top: 450, behavior: 'instant' });
    });
    await sleep(600);
    await saveScreen('08_doctor_queue_management.png', '08 - Doctor Admin Queue Management & Actions');

    // 9. Kiosk Display Board View
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const btns = Array.from(document.querySelectorAll('button'));
      const kioskBtn = btns.find(b => b.innerText.includes('Kiosk') || b.title?.includes('Kiosk'));
      if (kioskBtn) kioskBtn.click();
    });
    await sleep(800);
    await saveScreen('09_kiosk_live_display.png', '09 - Hospital Waiting Hall Kiosk Display Board');

    // 10. Phone Connect / Multi-device Sync Modal
    await page.evaluate(() => {
      // Switch back to Patient mode first
      const btns = Array.from(document.querySelectorAll('button'));
      const patBtn = btns.find(b => b.innerText.includes('Patient'));
      if (patBtn) patBtn.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      // Find Phone Connect button in navbar
      const btns = Array.from(document.querySelectorAll('button'));
      const phoneBtn = btns.find(b => b.innerText.includes('Phone') || b.querySelector('svg.lucide-smartphone') || b.title?.includes('Phone'));
      if (phoneBtn) phoneBtn.click();
    });
    await sleep(800);
    await saveScreen('10_phone_connect_modal.png', '10 - Mobile Phone Connect QR Pairing Modal');

    // Close Phone Connect Modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed button') ||
                       Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('✕') || b.querySelector('svg.lucide-x') || b.innerText.includes('Close'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(600);

    // 11. User Auth / Role Switcher Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const authBtn = btns.find(b => b.innerText.includes('Sign In') || b.innerText.includes('Login') || b.innerText.includes('Alex Morgan') || b.querySelector('svg.lucide-user'));
      if (authBtn) authBtn.click();
    });
    await sleep(800);
    await saveScreen('11_auth_role_modal.png', '11 - User Auth & Role Switcher Modal');

    console.log('All screenshots successfully captured!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
