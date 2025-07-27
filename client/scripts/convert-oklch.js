// scripts/convert-oklch.js
import fs from 'fs';
import * as culori from 'culori';

const FILE_PATH = './src/index.css'; // Adjust this path if your index.css lives elsewhere

const css = fs.readFileSync(FILE_PATH, 'utf8');

// Match all oklch() values
const oklchRegex = /oklch\(([^)]+)\)/g;

function convert(match) {
  const [l, c, h] = match
    .match(/oklch\(([^)]+)\)/)[1]
    .split(/[ ,]+/)
    .map(Number);
  const color = culori.oklch(l, c, h);
  const hsl = culori.hsl(color);

  if (!hsl || isNaN(hsl.h)) return match;

  const hStr = Math.round(hsl.h);
  const sStr = `${Math.round(hsl.s * 100)}%`;
  const lStr = `${Math.round(hsl.l * 100)}%`;

  return `hsl(${hStr} ${sStr} ${lStr})`;
}

const converted = css.replace(oklchRegex, convert);

fs.writeFileSync(FILE_PATH, converted);
console.log('✅ All OKLCH values converted to HSL in:', FILE_PATH);
