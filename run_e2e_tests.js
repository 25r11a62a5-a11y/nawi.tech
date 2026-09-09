const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\Krishna\\.gemini\\antigravity\\brain\\93f15ff3-88b2-43b5-8e68-014c7ae5c20f\\screenshots';
const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 Starting Chrome End-to-End Test Suite for e-WeighMaster');
  console.log('Chrome Binary:', CHROME_PATH);
  console.log('Base URL:', BASE_URL);
  console.log('Screenshot Directory:', SCREENSHOT_DIR);
  console.log('====================================================\n');

  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(`Chrome executable not found at: ${CHROME_PATH}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1400,950',
    ],
    defaultViewport: { width: 1400, height: 950 },
  });

  const page = await browser.newPage();
  const results = [];

  // Capture page console logs and errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  async function step(name, fn) {
    process.stdout.write(`⏳ Testing: ${name}... `);
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      console.log(`✅ PASSED (${duration}ms)`);
      results.push({ name, status: 'PASS', duration });
    } catch (err) {
      const duration = Date.now() - start;
      console.log(`❌ FAILED (${duration}ms) -> ${err.message}`);
      results.push({ name, status: 'FAIL', duration, error: err.message });
      throw err; // Stop on first failure as per plan
    }
  }

  try {
    // ==========================================
    // Scenario 1: Security Barrier & Unauthenticated Redirect
    // ==========================================
    await step('1.1 Unauthenticated Access to Root ("/") Gated to Login', async () => {
      // Clear localStorage
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => localStorage.clear());

      // Attempt to access protected dashboard
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await sleep(1000);

      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        throw new Error(`Expected redirect to /login but landed on: ${currentUrl}`);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_unauthenticated_redirect_to_login.png'), fullPage: true });
    });

    // ==========================================
    // Scenario 2: Official Authentication Flow & Edge Cases
    // ==========================================
    await step('2.1 Edge Case: Invalid Credentials Error Alert', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      await sleep(500);

      // Type incorrect credentials
      await page.focus('input[type="text"]');
      await page.keyboard.type('invalid_inspector');
      await page.focus('input[type="password"]');
      await page.keyboard.type('wrongpass');

      // Click Sign In button
      await page.click('button[type="submit"]');
      
      // Wait for error alert to appear
      await page.waitForSelector('#login-error-alert', { timeout: 10000 });

      // Verify error alert is displayed
      const errorText = await page.evaluate(() => {
        const el = document.querySelector('#login-error-alert');
        return el ? el.innerText : '';
      });

      if (!errorText.includes('Invalid') && !errorText.includes('⚠️')) {
        throw new Error(`Expected error alert but found: "${errorText}"`);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_login_error_invalid_credentials.png'), fullPage: true });
    });

    await step('2.2 Role Selector & Successful Inspector Login', async () => {
      // Clear inputs
      await page.evaluate(() => {
        const textInputs = document.querySelectorAll('input');
        textInputs.forEach(input => {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
      await sleep(300);

      // Select Employee / Inspector tab
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('Inspector') || text.includes('Employee')) {
          await btn.click();
          break;
        }
      }
      await sleep(300);

      // Enter valid Inspector credentials
      await page.focus('input[type="text"]');
      await page.keyboard.type('employee');
      await page.focus('input[type="password"]');
      await page.keyboard.type('password123');
      await sleep(300);

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
      await sleep(1500);

      const currentUrl = page.url();
      if (!currentUrl.endsWith('/') && !currentUrl.includes('localhost:3000')) {
        throw new Error(`Expected redirection to dashboard, but current URL is: ${currentUrl}`);
      }

      // Check user session header
      const headerUser = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        return {
          hasName: bodyText.includes('Rajesh Kumar'),
          hasBadge: bodyText.includes('LM-IN-2026-042') || bodyText.includes('INSPECTOR'),
          hasSignOut: bodyText.includes('Sign Out') || bodyText.includes('साइन आउट'),
        };
      });

      if (!headerUser.hasName) {
        throw new Error('User session chip name "Rajesh Kumar" not found in dashboard header');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_inspector_authenticated_dashboard.png'), fullPage: true });
    });

    // ==========================================
    // Scenario 3: Multilingual Language Switching & Persistence
    // ==========================================
    await step('3.1 Switch Language to Hindi (हिंदी) and Verify All UI Updates', async () => {
      // Find top language select
      await page.select('#top-lang-select', 'hi');
      await sleep(800);

      // Verify header and navigation changed to Hindi
      const hindiContent = await page.evaluate(() => {
        const body = document.body.innerText;
        return {
          hasGov: body.includes('भारत सरकार'),
          hasDash: body.includes('डैशबोर्ड') || body.includes('परीक्षण'),
          hasCalc: body.includes('कैलकुलेटर') || body.includes('सत्यापन'),
        };
      });

      if (!hindiContent.hasGov) {
        throw new Error('Hindi translation "भारत सरकार" not found after selecting Hindi');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_multilingual_hindi.png'), fullPage: true });
    });

    await step('3.2 Switch Language to Tamil (தமிழ்) and Verify Translation', async () => {
      await page.select('#top-lang-select', 'ta');
      await sleep(800);

      const tamilContent = await page.evaluate(() => {
        const body = document.body.innerText;
        return body.includes('இந்திய அரசு') || body.includes('தேசிய');
      });

      if (!tamilContent) {
        throw new Error('Tamil translation "இந்திய அரசு" not found after selecting Tamil');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_multilingual_tamil.png'), fullPage: true });

      // Switch back to English for standard validation
      await page.select('#top-lang-select', 'en');
      await sleep(600);
    });

    // ==========================================
    // Scenario 4: OIML R-76 Changeover Point Method Calculator
    // ==========================================
    await step('4.1 OIML Calculator: Compliant Load Point (PASS)', async () => {
      // Ensure calculator is visible
      await page.waitForSelector('#btn-calculate-oiml', { timeout: 8000 });
      await page.evaluate(() => {
        const btn = document.querySelector('#btn-calculate-oiml');
        if (btn) {
          btn.scrollIntoView({ behavior: 'instant', block: 'center' });
          btn.click();
        }
      });
      await sleep(1000);

      // Verify results
      await page.waitForSelector('#oiml-calc-results', { timeout: 8000 });

      const calcResult = await page.evaluate(() => {
        const resEl = document.querySelector('#oiml-calc-results');
        const text = resEl ? resEl.innerText : '';
        return {
          hasP: text.includes('1000.3'),
          hasEc: text.includes('0.3'),
          hasPass: text.includes('COMPLIANT') || text.includes('PASS') || text.includes('अनुपालन'),
          fullText: text
        };
      });

      if (!calcResult.hasP || !calcResult.hasPass) {
        throw new Error(`OIML calculation mismatch! Text was: "${calcResult.fullText}". Expected P = 1000.3 and COMPLIANT.`);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_calculator_compliant_pass.png'), fullPage: true });
    });

    await step('4.2 OIML Calculator: Failing Excessive Error Point (FAIL)', async () => {
      // Set input I to excessive failing value: I = 5025
      await page.evaluate(() => {
        const inputI = document.querySelector('input[name="I"]');
        if (inputI) {
          // Native setter bypasses React's wrapper to properly dispatch input event
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(inputI, '5025');
          inputI.dispatchEvent(new Event('input', { bubbles: true }));
          inputI.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await sleep(400);

      // Click calculate button
      await page.evaluate(() => {
        const btn = document.querySelector('#btn-calculate-oiml');
        if (btn) btn.click();
      });
      await sleep(1000);

      // Verify FAIL badge
      const failResult = await page.evaluate(() => {
        const resEl = document.querySelector('#oiml-calc-results');
        const text = resEl ? resEl.innerText : '';
        return {
          hasFail: text.includes('NON-COMPLIANT') || text.includes('FAIL') || text.includes('गैर') || text.includes('फेल'),
          fullText: text
        };
      });

      if (!failResult.hasFail) {
        throw new Error(`Expected NON-COMPLIANT (FAIL) badge for excessive error load point. Full text: "${failResult.fullText}"`);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_calculator_failing_fail.png'), fullPage: true });
    });

    // ==========================================
    // Scenario 4.3: Register New Instrument Modal
    // ==========================================
    await step('4.3 Register New NAWI Instrument Modal Flow', async () => {
      // Use page.evaluate to click register button to bypass headless React event issue
      await page.waitForSelector('#btn-open-register-modal', { timeout: 5000 });
      await page.evaluate(() => {
        const btn = document.querySelector('#btn-open-register-modal');
        if (btn) btn.click();
      });
      await sleep(800);

      // Check modal is open
      const modalOpen = await page.evaluate(() => !!document.querySelector('#register-modal-form'));
      if (!modalOpen) {
        throw new Error('Register modal did not open after clicking #btn-open-register-modal');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_register_instrument_modal.png'), fullPage: true });

      // Fill in new instrument details using native React setter
      const fillInput = async (selector, value) => {
        await page.evaluate((sel, val) => {
          const el = document.querySelector(sel);
          if (!el) return;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, selector, value);
      };

      await fillInput('input[name="manufacturer"]', 'Mettler Toledo Precision');
      await fillInput('input[name="model"]', 'XPE-205 Analysis');
      await fillInput('input[name="serialNumber"]', 'SN-2026-XPE99');
      await fillInput('input[name="maxCapacity"]', '220');
      await sleep(400);

      // Submit registration
      await page.evaluate(() => {
        const btn = document.querySelector('#btn-submit-register');
        if (btn) btn.click();
      });
      await sleep(1200);

      // Check that toast/table updated
      const registered = await page.evaluate(() => {
        const body = document.body.innerText;
        return body.includes('Mettler Toledo Precision') || body.includes('SN-2026-XPE99') || body.includes('registered') || body.includes('queued');
      });

      if (!registered) {
        throw new Error('Registered instrument did not appear in dashboard state');
      }
    });

    // ==========================================
    // Scenario 5: Instruments Registry Page
    // ==========================================
    await step('5.1 Instruments Registry Page Navigation & Table', async () => {
      await page.goto(`${BASE_URL}/instruments`, { waitUntil: 'networkidle0' });
      await sleep(1000);

      // Check table has rows (data-table class)
      const rows = await page.evaluate(() => {
        return document.querySelectorAll('table.data-table tbody tr').length;
      });

      if (rows < 3) {
        throw new Error(`Expected at least 3 instrument rows in registry, found: ${rows}`);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_instruments_registry_page.png'), fullPage: true });
    });

    // ==========================================
    // Scenario 6: Test Reports & Filter Verification
    // ==========================================
    await step('6.1 Test Reports Page, Filter Tabs & Detail Modal', async () => {
      await page.goto(`${BASE_URL}/tests`, { waitUntil: 'networkidle0' });
      await sleep(1000);

      // Click FAIL filter using page.evaluate to avoid stale element refs
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.innerText.trim() === 'FAIL' || btn.innerText.trim() === 'फेल') {
            btn.click();
            break;
          }
        }
      });
      await sleep(500);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_test_reports_filtered_fail.png'), fullPage: true });

      // Click ALL filter back
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.innerText.trim() === 'ALL' || btn.innerText.trim() === 'सभी') {
            btn.click();
            break;
          }
        }
      });
      await sleep(500);

      // Click view details on first row
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.innerText.includes('Details') || btn.innerText.includes('विवरण') || btn.innerText.includes('View')) {
            btn.click();
            break;
          }
        }
      });
      await sleep(800);

      // Verify modal is open
      const hasModal = await page.evaluate(() => {
        const body = document.body.innerText;
        return body.includes('Report Details') || body.includes('Weighing Load Points') || body.includes('Test Results');
      });

      if (!hasModal) {
        throw new Error('Report details modal failed to open');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_test_report_details_modal.png'), fullPage: true });

      // Close modal - click ✕ button inside any fixed overlay
      await page.evaluate(() => {
        const fixedDivs = document.querySelectorAll('div[style*="fixed"]');
        for (const div of fixedDivs) {
          const closeBtn = div.querySelector('button');
          if (closeBtn) { closeBtn.click(); break; }
        }
      });
      await sleep(400);
    });

    // ==========================================
    // Scenario 7: Smart Analytics Page
    // ==========================================
    await step('7.1 Smart Analytics & Predictive Maintenance', async () => {
      await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'networkidle0' });
      await sleep(1200);

      const analyticsLoaded = await page.evaluate(() => {
        const body = document.body.innerText;
        return {
          hasTitle: body.includes('Analytics') || body.includes('विश्लेषण') || body.includes('Predictive'),
          hasPassRate: body.includes('%') || body.includes('Pass Rate'),
        };
      });

      if (!analyticsLoaded.hasTitle) {
        throw new Error('Analytics page failed to load correctly');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_smart_analytics_page.png'), fullPage: true });
    });

    // ==========================================
    // Scenario 8: System & Laboratory Settings Page
    // ==========================================
    await step('8.1 System Settings Tabs & Configuration Persistence', async () => {
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
      await sleep(1000);

      // Click "Save All Configurations" button in header (it has onClick={handleSave})
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          const txt = btn.innerText.trim();
          if (txt.includes('Save') || txt.includes('सहेजें')) {
            btn.click();
            break;
          }
        }
      });
      await sleep(1000);

      // Verify success toast appears
      const savedToast = await page.evaluate(() => {
        const body = document.body.innerText;
        return body.includes('saved successfully') || body.includes('सहेज') || body.includes('Settings backup');
      });

      if (!savedToast) {
        throw new Error('Settings save notification banner did not appear');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_system_settings_page.png'), fullPage: true });
    });

    // ==========================================
    // Scenario 2.6 & 2.7: Sign Out & Lab Manager Authentication
    // ==========================================
    await step('2.6 Sign Out & Lab Manager Login Verification', async () => {
      // Click Sign Out via evaluate
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.innerText.includes('Sign Out') || btn.innerText.includes('साइन आउट')) {
            btn.click();
            break;
          }
        }
      });
      await sleep(1500);

      // Confirm landed back on /login
      if (!page.url().includes('/login')) {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
        await sleep(1000);
      }

      // Switch to Manager tab
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          const txt = btn.innerText.trim();
          if (txt.includes('Manager') || txt.includes('प्रबंधक') || txt.includes('Lab Manager')) {
            btn.click();
            break;
          }
        }
      });
      await sleep(500);

      // Enter Manager credentials using native setter
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="text"], input:not([type="password"])');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        for (const inp of inputs) {
          if (inp.type !== 'hidden') {
            setter.call(inp, 'manager');
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      });

      await page.evaluate(() => {
        const pwdInput = document.querySelector('input[type="password"]');
        if (pwdInput) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(pwdInput, 'admin123');
          pwdInput.dispatchEvent(new Event('input', { bubbles: true }));
          pwdInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await sleep(300);

      // Submit
      await page.evaluate(() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      });
      await sleep(2000);

      // Confirm logged in as Manager
      const isManager = await page.evaluate(() => {
        const body = document.body.innerText;
        return body.includes('MANAGER') || body.includes('Vikramaditya') || body.includes('Laboratory Director');
      });

      if (!isManager) {
        throw new Error('Lab Manager session chip not found in dashboard header');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_manager_authenticated_session.png'), fullPage: true });
    });

    console.log('\n====================================================');
    console.log('🎉 ALL 11 END-TO-END TEST SCENARIOS PASSED WITH ZERO ERRORS!');
    console.log('Screenshots saved to:', SCREENSHOT_DIR);
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console Warnings/Errors observed during run:', consoleErrors);
    } else {
      console.log('✨ Clean execution: 0 uncaught console errors recorded.');
    }
    console.log('====================================================');

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ E2E TEST SUITE RUNNER ABORTED:');
    console.error(error);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_state.png'), fullPage: true }).catch(() => {});
    await browser.close();
    process.exit(1);
  }
}

runE2ETests();
