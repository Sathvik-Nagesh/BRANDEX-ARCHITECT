const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').concat(walk('./scripts'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes("import { v4 as uuidv4 } from 'uuid'")) {
    content = content.replace(/import \{ v4 as uuidv4 \} from 'uuid'\r?\n/g, "");
    changed = true;
  }
  if (content.includes("require('uuid')")) {
    content = content.replace(/const \{ v4: uuidv4 \} = require\('uuid'\)\r?\n/g, "");
    changed = true;
  }
  if (content.includes('uuidv4()')) {
    content = content.replace(/uuidv4\(\)/g, "crypto.randomUUID()");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
