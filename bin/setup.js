#!/usr/bin/env node

/**
 * paseo-antigravity - Setup CLI
 * Zero-dependency setup script for connecting Google Antigravity 2.0 (agy) with Paseo.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');

console.log('\n====================================================');
console.log('🚀 Paseo Google Antigravity 2.0 Setup');
console.log('====================================================\n');

function findAgyBinary() {
  if (process.env.AGY_BIN && fs.existsSync(process.env.AGY_BIN)) {
    return process.env.AGY_BIN;
  }
  const commonPaths = [
    '/opt/homebrew/bin/agy',
    '/usr/local/bin/agy',
    path.join(os.homedir(), '.local', 'bin', 'agy'),
    path.join(os.homedir(), '.gemini', 'antigravity-cli', 'bin', 'agy')
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }
  try {
    const whichPath = execSync('which agy', { encoding: 'utf8' }).trim();
    if (whichPath && fs.existsSync(whichPath)) return whichPath;
  } catch (e) {}
  return 'agy';
}

function getModels(agyBin) {
  try {
    const stdout = execSync(`"${agyBin}" models`, { encoding: 'utf8' });
    const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);
    const models = lines.map(line => {
      const isDefault = line.startsWith('*');
      const id = isDefault ? line.substring(1).trim() : line;
      return { id, label: id, isDefault };
    });
    if (models.length > 0 && !models.some(m => m.isDefault)) {
      models[0].isDefault = true;
    }
    return models.length > 0 ? models : null;
  } catch (e) {
    return null;
  }
}

function main() {
  const agyBin = findAgyBinary();
  console.log(`[1/3] Resolved agy binary: ${agyBin}`);

  const discoveredModels = getModels(agyBin) || [
    { id: 'gemini-3.6-flash-high', label: 'gemini-3.6-flash-high', isDefault: true },
    { id: 'gemini-3.6-flash-medium', label: 'gemini-3.6-flash-medium' },
    { id: 'gemini-3.6-pro-high', label: 'gemini-3.6-pro-high' }
  ];
  console.log(`[2/3] Discovered ${discoveredModels.length} Gemini models.`);

  const home = os.homedir();
  const installDir = path.join(home, '.gemini', 'antigravity', 'paseo-bridge');
  const bridgeTarget = path.join(installDir, 'agy-bridge.py');
  const bridgeSrc = path.join(__dirname, 'agy-bridge.py');

  if (isDryRun) {
    console.log('[3/3] Dry run complete. Target bridge path:', bridgeTarget);
    return;
  }

  fs.mkdirSync(installDir, { recursive: true });
  fs.copyFileSync(bridgeSrc, bridgeTarget);
  fs.chmodSync(bridgeTarget, 0o755);
  console.log(`[3/3] Deployed bridge executable to: ${bridgeTarget}`);

  const paseoConfigPath = path.join(home, '.paseo', 'config.json');
  let config = { version: 1 };
  if (fs.existsSync(paseoConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(paseoConfigPath, 'utf8'));
    } catch (e) {}
  } else {
    fs.mkdirSync(path.dirname(paseoConfigPath), { recursive: true });
  }

  if (!config.agents) config.agents = {};
  if (!config.agents.providers) config.agents.providers = {};

  config.agents.providers['antigravity'] = {
    extends: 'claude',
    enabled: true,
    label: 'Google Antigravity 2.0',
    description: 'Google Antigravity Agent via zero-dependency bridge',
    command: [bridgeTarget],
    env: {
      AGY_BIN: agyBin
    },
    models: discoveredModels,
    _last_model_sync: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync(paseoConfigPath, JSON.stringify(config, null, 2), 'utf8');
  console.log(`\n✔ Successfully configured Paseo at: ${paseoConfigPath}`);

  try {
    execSync('killall Paseo 2>/dev/null || true');
    execSync('open -a Paseo 2>/dev/null || true');
    console.log('✔ Restarted Paseo application.\n');
  } catch (e) {}

  console.log('🎉 Setup complete! Select Google Antigravity 2.0 in Paseo to begin.');
}

if (process.argv[1] && process.argv[1].endsWith('setup.js')) {
  main();
}
