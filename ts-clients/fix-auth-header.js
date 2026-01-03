const fs = require('fs');
const path = require('path');

/**
 * Fixes Authorization header in generated TypeScript clients.
 * Changes "Bearer" to "Token" for DRF TokenAuthentication compatibility.
 */
function fixAuthHeader(dir, description = '') {
  const requestTsPath = path.join(dir, 'core', 'request.ts');
  
  if (!fs.existsSync(requestTsPath)) {
    console.warn(`⚠️  ${requestTsPath} not found, skipping${description ? ` (${description})` : ''}...`);
    return false;
  }

  try {
    let content = fs.readFileSync(requestTsPath, 'utf8');
    
    // Check if it already uses Token
    if (content.includes(`Token \${token}`)) {
      console.log(`✅ Authorization header already uses Token format${description ? ` (${description})` : ''}`);
      return true;
    }
    
    // Replace Bearer with Token
    if (content.includes(`Bearer \${token}`)) {
      content = content.replace(
        /headers\['Authorization'\] = `Bearer \$\{token\}`;/g,
        `headers['Authorization'] = \`Token \${token}\`;`
      );
      
      fs.writeFileSync(requestTsPath, content, 'utf8');
      console.log(`✅ Fixed Authorization header: Bearer → Token${description ? ` (${description})` : ''}`);
      return true;
    } else {
      console.warn(`⚠️  Could not find Authorization header pattern in ${requestTsPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${requestTsPath}:`, error);
    return false;
  }
}

// Main execution
const scriptDir = __dirname;

// Fix ts-clients/generated
const generatedDir = path.join(scriptDir, 'generated');
let fixedGenerated = false;
if (fs.existsSync(generatedDir)) {
  fixedGenerated = fixAuthHeader(generatedDir, 'ts-clients/generated');
}

// Fix frontend clients if they exist
const frontendApiDir = path.join(scriptDir, '..', 'inventory-management-frontend', 'src', 'api');
let fixedFrontend = false;
if (fs.existsSync(frontendApiDir)) {
  fixedFrontend = fixAuthHeader(frontendApiDir, 'frontend/src/api');
}

if (!fixedGenerated && !fixedFrontend) {
  console.error('❌ No request.ts files found to fix');
  process.exit(1);
} else {
  console.log('\n✅ Auth header fix complete!');
}

