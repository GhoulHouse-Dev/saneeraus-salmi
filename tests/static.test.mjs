import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('page contains one primary H1 and key conversion points', () => {
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /Saneeraus-, purku- tai vahinkokohde/);
  assert.match(html, /data-lead-form/);
  assert.match(html, /id="tarjouspyynto"/);
  assert.match(html, /045 7830 5122/);
});

test('page includes required trust and service content', () => {
  assert.match(html, /C-27526-33-23/);
  assert.match(html, /SAP ry/);
  assert.match(html, /Valttikortti/);
  assert.match(html, /Vesivahingossa nopea reagointi/);
});
