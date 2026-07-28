import { test } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

test('bridge script runs and passes help flag to agy', () => {
  const bridgePath = path.resolve('bin/agy-bridge.py');
  const res = spawnSync('python3', [bridgePath, '--help'], { encoding: 'utf8' });
  const combinedOutput = (res.stdout || '') + (res.stderr || '');
  assert.match(combinedOutput, /Usage of agy/i);
});

test('bridge script translates permission-mode flags cleanly', () => {
  const bridgePath = path.resolve('bin/agy-bridge.py');
  // Test --permission-mode bypass -> --dangerously-skip-permissions with --help
  const res = spawnSync('python3', [bridgePath, '--permission-mode', 'bypass', '--help'], { encoding: 'utf8' });
  const combinedOutput = (res.stdout || '') + (res.stderr || '');
  assert.match(combinedOutput, /Usage of agy/i);
});
