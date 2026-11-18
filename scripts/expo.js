#!/usr/bin/env node
/**
 * Startet die Expo-CLI mit abgeschalteter Telemetrie (EXPO_NO_TELEMETRY=1),
 * plattformunabhängig (Mac, Windows, Linux).
 */
const { spawnSync } = require('child_process');
const env = { ...process.env, EXPO_NO_TELEMETRY: '1' };
const r = spawnSync('npx', ['expo', ...process.argv.slice(2)], { stdio: 'inherit', env, shell: process.platform === 'win32' });
process.exit(r.status ?? 1);
