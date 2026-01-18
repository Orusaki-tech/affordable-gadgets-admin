const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'models', 'BlankEnum.ts');

if (!fs.existsSync(target)) {
  process.exit(0);
}

const content = fs.readFileSync(target, 'utf8');
const fixed = content.replace(
  /export enum BlankEnum\s*{[^}]*}/s,
  "export type BlankEnum = '';"
);

if (fixed !== content) {
  fs.writeFileSync(target, fixed, 'utf8');
}
