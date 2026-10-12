#!/usr/bin/env node
'use strict';
/*
 * Verificaciones básicas sin dependencias: sintaxis de todos los .js, JSON válido,
 * archivo autónomo al día y ausencia de patrones típicos de secretos.
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules']);
let problems = 0;
const fail = (m) => { console.error('✖ ' + m); problems++; };

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    if (SKIP.has(e.name)) return;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  });
  return out;
}

const files = walk(ROOT, []);

files.filter((f) => f.endsWith('.js')).forEach((f) => {
  const r = cp.spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) fail(`sintaxis: ${path.relative(ROOT, f)}\n${r.stderr}`);
});

files.filter((f) => f.endsWith('.json')).forEach((f) => {
  try { JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { fail(`JSON inválido: ${path.relative(ROOT, f)} (${e.message})`); }
});

const SECRETS = [/ghp_[A-Za-z0-9]{20,}/, /gho_[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /sk-[A-Za-z0-9]{32,}/];
files.filter((f) => /\.(js|json|md|html|css|yml|yaml|cff|txt|csv)$/.test(f)).forEach((f) => {
  const t = fs.readFileSync(f, 'utf8');
  SECRETS.forEach((re) => { if (re.test(t)) fail(`posible secreto en ${path.relative(ROOT, f)}`); });
});

const b = cp.spawnSync(process.execPath, [path.join(__dirname, 'build-standalone.js'), '--check'], { encoding: 'utf8' });
if (b.status !== 0) fail(b.stderr.trim());

if (problems) { console.error(`${problems} problema(s)`); process.exit(1); }
console.log('verificaciones básicas: OK');
