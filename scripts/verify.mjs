import { readFile } from 'node:fs/promises';

const files = ['index.html','styles.css','script.js','api/lead.js','lib/lead-validation.js','vercel.json'];
for (const file of files) {
  const content = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  if (!content.trim()) throw new Error(`${file} is empty`);
}
console.log('Static verification passed.');
