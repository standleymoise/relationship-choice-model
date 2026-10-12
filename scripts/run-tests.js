#!/usr/bin/env node
'use strict';
/*
 * Ejecuta tests/*.test.js con el ejecutor integrado de Node (node:test).
 * Pasa la lista de archivos explícitamente porque Node 20 no expande patrones glob en --test.
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const dir = path.join(__dirname, '..', 'tests');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.test.js')).sort().map((f) => path.join(dir, f));
const r = cp.spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
