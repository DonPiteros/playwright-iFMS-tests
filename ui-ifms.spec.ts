import { test, expect } from '@playwright/test';

// =======================
// 🔹 KONFIG
// =======================

let ip = process.env.BASE_URL || 'http://192.168.10.22';

if (!ip.includes(':8123')) {
  ip = `${ip}:8123`;
}

// =======================
// 🔹 HELPERY
// =======================

async function type(page, text: string) {
  for (const c of text) {
    await page.locator('div').filter({ hasText: new RegExp(`^${c}$`) }).click();
  }
}

async function login(page) {
  await page.getByRole('textbox', { name: 'Username' }).click();
  await type(page, 'ifms');

  await page.getByLabel('Password').click();
  await page.locator('div').filter({ hasText: /^ABC$/ }).click();
  await page.locator('div').filter({ hasText: /^\?123$/ }).click();
  await type(page, '1234');

  await page.getByText('LOG IN').click();
}

// 🔥 NOWY RESET (stabilny)
async function goHome(page, ip) {
  await page.goto(`${ip}/home`, { waitUntil: 'domcontentloaded' });

  // czekamy aż dashboard faktycznie wróci
  await page.getByText('System Time').waitFor({ timeout: 15000 });
}

// =======================
// 🔹 TEST
// =======================

test('iFMS UI - FINAL STABLE VERSION', async ({ page }) => {

  // 🔐 LOGIN
  await page.goto(`${ip}/login`);
  await login(page);

  await page.getByText('System Time').waitFor({ timeout: 10000 });

  // =======================
  // 🟢 PODSTAWOWE KAFELKI
  // =======================

  for (const name of ['System Time', 'Vehicle Parameters']) {
    console.log('Klik:', name);

    await page.getByText(name).click();
    await page.waitForTimeout(3000);

    await goHome(page, ip);
  }

  // =======================
  // 🔴 IPT2 (NAPRAWIONE)
  // =======================

  let ipt = await page.getByText('IPT2 B').count()
    ? 'IPT2 B'
    : 'IPT2 A';

  console.log('Klik:', ipt);

  await page.getByText(ipt).click();
  await page.waitForTimeout(2000);

  // login jeśli potrzeba
  if (await page.getByRole('textbox', { name: 'Username' }).count()) {
    console.log('Logowanie do IPT2...');
    await login(page);

    console.log('Czekam na dashboard po loginie...');

    const tileAfterLogin = page.getByText(ipt, { exact: true });

    await tileAfterLogin.waitFor({ state: 'visible', timeout: 10000 });

    await page.waitForTimeout(1000);

    console.log('Ponowne kliknięcie IPT2...');
    await tileAfterLogin.click();
  }

  await page.waitForTimeout(3000);

  await goHome(page, ip);

  // =======================
// 🔵 IDR-i3
// =======================

console.log('Klik: IDR-i3');

await page.getByText('IDR-i3', { exact: true }).click();

// zamiast timeout
await page.getByRole('button', { name: 'Acoustics' }).waitFor();

// =======================
// 🔵 Acoustics
// =======================

await test.step('IDR-i3 → Acoustics → SETTINGS → TEST → BACK', async () => {

  const acoustics = page.getByRole('button', { name: 'Acoustics' });

  if (!(await acoustics.isVisible())) {
    throw new Error('Acoustics tile not visible');
  }

  await acoustics.click();

  const settingsTab = page.getByRole('tab', { name: 'SETTINGS' });
  await settingsTab.waitFor();
  await settingsTab.click();

  const testTab = page.getByRole('tab', { name: 'TEST' });
  await testTab.waitFor();
  await testTab.click();

  await expect(testTab).toBeVisible();

  await page.locator('#navBack').click();
});

// =======================
// 🔵 NOWE FLOW (Discrete + Network + Ports)
// =======================

await test.step('IDR-i3 → Discrete I/O + Network + Ports', async () => {

  // 🔵 Discrete I/O
  const dio = page.getByRole('button', { name: 'Discrete I/O' });

  if (await dio.isVisible()) {
    await dio.click();

    await page.getByText('LOGICAL OUTPUTS').click();
    await page.getByText('PHYSICAL INPUTS').click();
    await page.getByText('PHYSICAL OUTPUTS').click();

    await expect(page.getByText('PHYSICAL OUTPUTS')).toBeVisible();

    await page.locator('#navBack').click();
  }

  // 🔵 Network
  const network = page.getByRole('button', { name: 'Network' });

  if (await network.isVisible()) {
    await network.click();

  // Adapter
const adapterBtn = page.getByRole('button', { name: 'Adapter' });

if (await adapterBtn.isVisible()) {
  await adapterBtn.click();

  // ✅ czekamy na zmianę widoku
  await page.locator('#navBack').waitFor();

  // (opcjonalnie coś bardziej konkretnego)
  // await page.getByText('IP Configuration').waitFor();

  await page.locator('#navBack').click();
}

    // Routing
    await page.getByRole('button', { name: 'Routing' }).click();
const frame = page.frameLocator('iframe');

await frame.getByText(/^NAT$/).click();
await frame.getByText(/^REV-NAT$/).click();
await frame.getByText(/^GRE$/).click();
await frame.getByText(/^RIP$/).click();

 await page.locator('#navBack').click();

    // Wi-Fi
    await page.getByRole('button', { name: 'Wi-Fi' }).click();
    await page.locator('#navBack').click();

    // Certificate
    await page.getByRole('button', { name: 'Certificate' }).click();
    await page.locator('#navBack').click();

    await page.locator('#navBack').click();
  }

  // 🔵 Ports
  const ports = page.getByRole('button', { name: 'Ports' });

if (await ports.count()) {
  await ports.click();

  await page.locator('#navBack').waitFor();

  await page.locator('#navBack').click();
}
// =======================
// 🔵 RADIO + LOCATION + DEVICE + TEST + USER SETTINGS
// =======================

  // 🔵 Radio
  const radio = page.getByRole('button', { name: 'Radio' });

  if (await radio.isVisible()) {
    await radio.click();

    await page.getByRole('button', { name: 'PLMN' }).click();
    await page.locator('span').filter({ hasText: 'SIM CARD' }).first().click();
    await page.locator('span').filter({ hasText: 'CELLULAR' }).first().click();

    const pocTab = page.getByRole('tab', { name: 'POC' });
    await pocTab.waitFor();
    await pocTab.click();

    await page.locator('#navBack').click();
    await page.locator('#navBack').click();
  }

  // 🔵 Location
  const location = page.getByRole('button', { name: 'Location' });

  if (await location.isVisible()) {
    await location.click();

    await page.getByRole('button', { name: 'Odometer' }).click();

    const calibrationTab = page.getByRole('tab', { name: 'CALIBRATION' });
    await calibrationTab.waitFor();
    await calibrationTab.click();

    await page.getByText('CONFIGURATION').click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'GNSS' }).click();

    const configTab = page.getByRole('tab', { name: 'CONFIGURATION' });
    await configTab.waitFor();
    await configTab.click();

    await page.locator('#navBack').click();
    await page.locator('#navBack').click();
  }

  // 🔵 Device Roles
  const deviceRoles = page.getByRole('button', { name: 'Device Roles' });

  if (await deviceRoles.isVisible()) {
    await deviceRoles.click();
    await page.locator('#navBack').click();
  }

  // 🔵 Storage
  const storage = page.getByRole('button', { name: 'Storage' });

  if (await storage.isVisible()) {
    await storage.click();

    const frame = page.frameLocator('iframe');

    await frame.getByText('Data (ext3)').click();
    await frame.getByText('Database (ext3)').click();
    await frame.getByText('Scratch (tmpfs)').click();

    await page.locator('#navBack').click();
  }

  // 🔵 Devices
  const devices = page.getByRole('button', { name: 'Devices' });

  if (await devices.isVisible()) {
    await devices.click();

    await page.getByRole('button', { name: 'Device List' }).click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'DNS-SD Scanner' }).click();
    await page.locator('#navBack').click();

    await page.locator('#navBack').click();
  }

  // 🔵 Test
  const testBtn = page.getByRole('button', { name: 'Test' });

  if (await testBtn.isVisible()) {
    await testBtn.click();

    await page.getByRole('button', { name: 'Hardware/Functions' }).click();

    const hwItems = [
      'Micro SD Card',
      'GNSS',
      'Wi-Fi',
      'RTC',
      'FIRMWARE',
      'SIM Card',
      'Harddisk (SSD)'
    ];

    for (const item of hwItems) {
      await page.getByRole('button', { name: item }).click();
      await page.locator('#navBack').click();
    }

    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'TLP' }).click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'Connectivity' }).click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'VDS Test Agent' }).click();
    await page.locator('#navBack').click();

    await page.locator('#navBack').click();
  }

  // 🔵 User Settings
  const userSettings = page.getByRole('button', { name: 'User Settings' });

  if (await userSettings.isVisible()) {
    await userSettings.click();

    await page.getByRole('button', { name: 'Export Config' }).click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'Dongle Param' }).click();
    await page.frameLocator('iframe')
      .locator('#DivImportTabButton')
      .getByText('Import')
      .click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'Environment Param' }).click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'System Update' }).click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'Versions' }).click();

    const detailsTab = page.getByRole('tab', { name: 'DETAILS' });
    await detailsTab.waitFor();
    await detailsTab.click();

    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'Device Info' }).click();
    await page.locator('#navBack').click();

    await page.getByRole('button', { name: 'Fusion Realm' }).click();
    await page.locator('#navBack').click();

    await page.locator('#navBack').click();
  }

  // 🔚 Exit
  await page.locator('#exit').click();
});
});