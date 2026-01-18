const fs = require('fs');
const path = require('path');

/**
 * Replace node FormData import with browser FormData usage in generated client.
 */
const requestTsPath = path.join(__dirname, '..', 'src', 'core', 'request.ts');

if (!fs.existsSync(requestTsPath)) {
  console.warn(`⚠️  ${requestTsPath} not found, skipping FormData fix...`);
  process.exit(0);
}

try {
  let content = fs.readFileSync(requestTsPath, 'utf8');

  // If already updated, no-op.
  if (content.includes('getFormDataConstructor')) {
    console.log('✅ FormData fix already applied');
    process.exit(0);
  }

  // Remove import and replace FormData usage checks
  content = content.replace(
    /import FormData from 'form-data';\n/,
    ''
  );

  content = content.replace(
    /export const isFormData = \(value: any\): value is FormData => {\n\s*return value instanceof FormData;\n};\n/s,
    [
      "const getFormDataConstructor = (): any => {",
      "    const FormDataCtor = (globalThis as any)?.FormData;",
      "    return typeof FormDataCtor === 'function' ? FormDataCtor : undefined;",
      "};",
      "",
      "export const isFormData = (value: any): value is any => {",
      "    const FormDataCtor = getFormDataConstructor();",
      "    return Boolean(FormDataCtor && value instanceof FormDataCtor);",
      "};",
      ""
    ].join('\n')
  );

  content = content.replace(
    /export const getFormData = \(options: ApiRequestOptions\): FormData \| undefined => {\n\s*if \(options\.formData\) {\n\s*const formData = new FormData\(\);\n/s,
    [
      "export const getFormData = (options: ApiRequestOptions): any | undefined => {",
      "    if (options.formData) {",
      "        const FormDataCtor = getFormDataConstructor();",
      "        if (!FormDataCtor) {",
      "            throw new Error('FormData is not available in this environment');",
      "        }",
      "        const formData = new FormDataCtor();",
      ""
    ].join('\n')
  );

  content = content.replace(
    /const formHeaders = typeof formData\?\.getHeaders === 'function' && formData\?\.getHeaders\(\) \|\| \{\}/,
    "const formHeaders =\n        typeof (formData as any)?.getHeaders === 'function' ? (formData as any).getHeaders() : {}"
  );

  fs.writeFileSync(requestTsPath, content, 'utf8');
  console.log('✅ Updated FormData usage to browser FormData');
} catch (error) {
  console.error(`❌ Error updating FormData usage:`, error);
  process.exit(1);
}
