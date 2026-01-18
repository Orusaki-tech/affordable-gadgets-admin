const fs = require('fs');
const path = require('path');

/**
 * Fixes Authorization header in generated TypeScript client.
 * Changes "Bearer" to "Token" for DRF TokenAuthentication compatibility.
 */
const requestTsPath = path.join(__dirname, '..', 'src', 'core', 'request.ts');

if (!fs.existsSync(requestTsPath)) {
  console.warn(`⚠️  ${requestTsPath} not found, skipping auth header fix...`);
  process.exit(0);
}

try {
  let content = fs.readFileSync(requestTsPath, 'utf8');

  // Already fixed?
  if (content.includes('`Token ${token}`')) {
    console.log('✅ Authorization header already uses Token format');
    process.exit(0);
  }

  if (content.includes('`Bearer ${token}`')) {
    content = content.replace(
      /headers\['Authorization'\] = `Bearer \$\{token\}`;/g,
      "headers['Authorization'] = `Token ${token}`;"
    );

    fs.writeFileSync(requestTsPath, content, 'utf8');
    console.log('✅ Fixed Authorization header: Bearer → Token');
    process.exit(0);
  }

  console.warn(`⚠️  Could not find Authorization header pattern in ${requestTsPath}`);
  process.exit(1);
} catch (error) {
  console.error(`❌ Error fixing ${requestTsPath}:`, error);
  process.exit(1);
}
