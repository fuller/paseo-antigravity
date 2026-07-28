import { test } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

test('setup.js locates agy and validates dry-run output', () => {
  const setupPath = path.resolve('bin/setup.js');
  const res = spawnSync('node', [setupPath, '--dry-run'], { encoding: 'utf8' });
  const combinedOutput = (res.stdout || '') + (res.stderr || '');
  assert.match(combinedOutput, /Paseo Google Antigravity 2.0 Setup/i);
  assert.match(combinedOutput, /Dry run complete/i);
});
