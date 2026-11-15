export type VaultMode = 'real' | 'decoy' | 'panic_wipe' | 'invalid';

export interface PinConfig {
  realPin: string;
  decoyPin: string;
  panicPin: string;
}

export const DEFAULT_PIN_CONFIG: PinConfig = {
  realPin: '2026',
  decoyPin: '0000',
  panicPin: '9999',
};

export function resolvePinMode(enteredPin: string, config: PinConfig): VaultMode {
  const clean = enteredPin.trim();
  if (!clean) return 'invalid';
  if (clean === config.panicPin) return 'panic_wipe';
  if (clean === config.decoyPin) return 'decoy';
  if (clean === config.realPin) return 'real';
  return 'invalid';
}

export interface StalkerwareSignalInput {
  unknownDeviceAdmin: boolean;
  accessibilityServiceAbuse: boolean;
  hiddenLauncherIcon: boolean;
  backgroundMicOrLocationSpike: boolean;
  unrecognizedBatteryDrain: boolean;
  sideloadedUnknownApp: boolean;
}

export interface StalkerwareAssessment {
  riskScore: number; // 0-100
  threatLevel: 'Clean' | 'Review Suggested' | 'High Stalkerware Risk';
  findings: Array<{
    title: string;
    severity: 'high' | 'medium';
    remediation: string;
  }>;
}

export function evaluateStalkerwareRisk(input: StalkerwareSignalInput): StalkerwareAssessment {
  let riskScore = 0;
  const findings: StalkerwareAssessment['findings'] = [];

  if (input.unknownDeviceAdmin) {
    riskScore += 28;
    findings.push({
      title: 'Unrecognized Device Administrator active',
      severity: 'high',
      remediation: 'Open Settings -> Security -> Device Admin Apps and revoke unknown entries immediately.',
    });
  }
  if (input.accessibilityServiceAbuse) {
    riskScore += 25;
    findings.push({
      title: 'Non-accessibility app holds full Screen/Keystroke Accessibility permission',
      severity: 'high',
      remediation: 'Disable suspicious Accessibility services and check WhatsApp/Signal linked devices.',
    });
  }
  if (input.hiddenLauncherIcon) {
    riskScore += 22;
    findings.push({
      title: 'Stealth package with hidden home-screen launcher icon detected',
      severity: 'high',
      remediation: 'Inspect Settings -> Apps -> See all apps (show system/disabled) for generic names like "System Update Service".',
    });
  }
  if (input.backgroundMicOrLocationSpike) {
    riskScore += 15;
    findings.push({
      title: 'Repeated background microphone / GPS wakeups while screen locked',
      severity: 'medium',
      remediation: 'Check Privacy Dashboard (24h timeline) and revoke Always-Allow permissions.',
    });
  }
  if (input.sideloadedUnknownApp) {
    riskScore += 15;
    findings.push({
      title: 'App installed outside official Play Store / App Store',
      severity: 'medium',
      remediation: 'Run Play Protect scan and audit APK sources; change primary Google/Apple account password from a safe device.',
    });
  }
  if (input.unrecognizedBatteryDrain) {
    riskScore += 10;
    findings.push({
      title: 'Unexplained overnight cellular upload / battery drain',
      severity: 'medium',
      remediation: 'Review cellular data usage per app and enable Sakhi360 Calculator Stealth mode before changing passwords.',
    });
  }

  const clamped = Math.min(100, riskScore);
  let threatLevel: StalkerwareAssessment['threatLevel'] = 'Clean';
  if (clamped >= 45) {
    threatLevel = 'High Stalkerware Risk';
  } else if (clamped >= 15) {
    threatLevel = 'Review Suggested';
  }

  return {
    riskScore: clamped,
    threatLevel,
    findings,
  };
}

/**
 * Real Web Crypto AES-256-GCM encryption for private journal & vault records.
 * Uses PBKDF2 key derivation from the user's vault passphrase/PIN so plaintext never touches localStorage.
 */
async function deriveAesKey(passphrase: string, saltBytes: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: 60000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export async function encryptVaultText(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt);
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encoded,
  );
  const cipherBytes = new Uint8Array(cipherBuffer);
  return `AES256GCM.${toBase64(salt)}.${toBase64(iv)}.${toBase64(cipherBytes)}`;
}

export async function decryptVaultText(payload: string, passphrase: string): Promise<string> {
  const parts = payload.split('.');
  if (parts.length !== 4 || parts[0] !== 'AES256GCM') {
    throw new Error('Invalid encrypted payload format');
  }
  const salt = fromBase64(parts[1]);
  const iv = fromBase64(parts[2]);
  const cipherBytes = fromBase64(parts[3]);
  const key = await deriveAesKey(passphrase, salt);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    cipherBytes as BufferSource,
  );
  return new TextDecoder().decode(plainBuffer);
}

export function evaluateCalculatorExpression(expr: string): string {
  const sanitized = expr.replace(/[^0-9+\-*/.%() ]/g, '').trim();
  if (!sanitized) return '0';
  try {
    // Safe arithmetic evaluator supporting +, -, *, /, %, parentheses
    const fn = new Function(`"use strict"; return (${sanitized});`);
    const result = fn();
    if (typeof result !== 'number' || !Number.isFinite(result)) {
      return 'Error';
    }
    return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(6)));
  } catch {
    return 'Error';
  }
}
