import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PIN_CONFIG,
  resolvePinMode,
  evaluateStalkerwareRisk,
  encryptVaultText,
  decryptVaultText,
  evaluateCalculatorExpression,
} from './defenseEngine';

test('resolvePinMode routes real, decoy, panic wipe, and invalid PINs', () => {
  assert.equal(resolvePinMode('2026', DEFAULT_PIN_CONFIG), 'real');
  assert.equal(resolvePinMode('0000', DEFAULT_PIN_CONFIG), 'decoy');
  assert.equal(resolvePinMode('9999', DEFAULT_PIN_CONFIG), 'panic_wipe');
  assert.equal(resolvePinMode('1234', DEFAULT_PIN_CONFIG), 'invalid');
});

test('evaluateStalkerwareRisk identifies high risk spyware permissions', () => {
  const clean = evaluateStalkerwareRisk({
    unknownDeviceAdmin: false,
    accessibilityServiceAbuse: false,
    hiddenLauncherIcon: false,
    backgroundMicOrLocationSpike: false,
    unrecognizedBatteryDrain: false,
    sideloadedUnknownApp: false,
  });
  assert.equal(clean.threatLevel, 'Clean');

  const high = evaluateStalkerwareRisk({
    unknownDeviceAdmin: true,
    accessibilityServiceAbuse: true,
    hiddenLauncherIcon: false,
    backgroundMicOrLocationSpike: true,
    unrecognizedBatteryDrain: false,
    sideloadedUnknownApp: false,
  });
  assert.equal(high.threatLevel, 'High Stalkerware Risk');
  assert.equal(high.findings.length, 3);
});

test('encryptVaultText and decryptVaultText perform real AES-256-GCM round-trip', async () => {
  const secret = 'Private journal entry: felt overwhelmed today, practiced 4-7-8 breathing.';
  const cipher = await encryptVaultText(secret, '2026');
  assert.ok(cipher.startsWith('AES256GCM.'));
  assert.ok(!cipher.includes('overwhelmed'));

  const decrypted = await decryptVaultText(cipher, '2026');
  assert.equal(decrypted, secret);

  await assert.rejects(() => decryptVaultText(cipher, '0000'));
});

test('evaluateCalculatorExpression evaluates standard math safely', () => {
  assert.equal(evaluateCalculatorExpression('12 + 8 * 2'), '28');
  assert.equal(evaluateCalculatorExpression('45 / 9'), '5');
  assert.equal(evaluateCalculatorExpression('1 / 0'), 'Error');
});
