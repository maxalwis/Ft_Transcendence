import fs from 'fs';
import path from 'path';

// ============================================================
// Configuration
// ============================================================

const LOCALES_DIR = './src/locales';
const SOURCE_DIR = './src';
const REFERENCE_LOCALE = 'fr';

const locales = ['fr', 'en', 'es', 'ar'];

const SOURCE_EXTENSIONS = /\.(js|jsx|ts|tsx)$/;

// ============================================================
// ANSI colors
// ============================================================

const RESET = '\x1b[0m';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

const WHITE_ON_RED = '\x1b[41;37m';
const BLACK_ON_YELLOW = '\x1b[43;30m';
const WHITE_ON_GREEN = '\x1b[42;37m';
const WHITE_ON_BLUE = '\x1b[44;37m';

const BOLD = '\x1b[1m';

// ============================================================
// Helpers
// ============================================================

function color(text, ansiColor) {
  return `${ansiColor}${text}${RESET}`;
}

function loadLocale(locale) {
  const file = path.join(LOCALES_DIR, `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// ============================================================
// Source files
// ============================================================

function getSourceFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === 'build' ||
      entry.name === '.git'
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getSourceFiles(fullPath));
    } else if (SOURCE_EXTENSIONS.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// ============================================================
// Find translation keys in source code
// ============================================================

function getTranslationKeysFromSource() {
  const files = getSourceFiles(SOURCE_DIR);

  const translations = [];
  const dynamicTranslations = [];

  // Static:
  // t("events.loading")
  // t('events.loading')
  // t("events.loading", { count })
  const staticRegex = /(?:\bi18n\.)?\bt\(\s*(["'])(.*?)\1/g;

  // Dynamic:
  // t(`categories.${code}`)
  const dynamicRegex = /(?:\bi18n\.)?\bt\(\s*`([^`]*)`\s*[,)]/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];

      // Static keys
      for (const match of line.matchAll(staticRegex)) {
        translations.push({
          key: match[2],
          file,
          line: lineNumber + 1,
          sourceLine: line.trim(),
        });
      }

      // Dynamic keys
      for (const match of line.matchAll(dynamicRegex)) {
        const key = match[1];

        if (key.includes('${')) {
          dynamicTranslations.push({
            key,
            file,
            line: lineNumber + 1,
            sourceLine: line.trim(),
          });
        }
      }
    }
  }

  return {
    translations,
    dynamicTranslations,
  };
}

// ============================================================
// Load reference locale
// ============================================================

const reference = loadLocale(REFERENCE_LOCALE);
const referenceKeys = new Set(getKeys(reference));

let hasErrors = false;

// ============================================================
// CHECK 1: Source code → fr.json
// ============================================================

console.log(
  `\n${WHITE_ON_BLUE}${BOLD} Checking source code against ${REFERENCE_LOCALE}.json ${RESET}\n`
);

const { translations: sourceTranslations, dynamicTranslations } = getTranslationKeysFromSource();

const usedKeys = new Map();

for (const translation of sourceTranslations) {
  if (!usedKeys.has(translation.key)) {
    usedKeys.set(translation.key, []);
  }

  usedKeys.get(translation.key).push(translation);
}

const missingFromReference = [...usedKeys.entries()].filter(([key]) => !referenceKeys.has(key));

// ------------------------------------------------------------
// Missing translations
// ------------------------------------------------------------

if (missingFromReference.length === 0) {
  console.log(
    `${WHITE_ON_GREEN}${BOLD} ✓ All translation keys used in code exist in fr.json ${RESET}\n`
  );
} else {
  hasErrors = true;

  console.log(`${WHITE_ON_RED}${BOLD} Missing translations used in code ${RESET}\n`);

  for (const [key, usages] of missingFromReference) {
    console.log(`   ${BOLD}${RED}${key}${RESET}`);

    for (const usage of usages) {
      console.log(`      ${GRAY}→ ${usage.file}:${usage.line}${RESET}`);

      console.log(`        ${GRAY}${usage.sourceLine}${RESET}`);
    }

    console.log('');
  }
}

// ============================================================
// Dynamic translation keys
// ============================================================

if (dynamicTranslations.length > 0) {
  console.log(
    `${BLACK_ON_YELLOW}${BOLD} Dynamic translation keys: manual check required ${RESET}\n`
  );

  for (const translation of dynamicTranslations) {
    console.log(`   ${BOLD}${YELLOW}${translation.key}${RESET}`);

    console.log(`      ${GRAY}→ ${translation.file}:${translation.line}${RESET}`);

    console.log(`        ${GRAY}${translation.sourceLine}${RESET}`);

    console.log('');
  }
}

// ============================================================
// CHECK 2: Locale files → fr.json
// ============================================================

console.log(
  `\n${WHITE_ON_BLUE}${BOLD} Checking locale files against ${REFERENCE_LOCALE}.json ${RESET}\n`
);

for (const locale of locales) {
  if (locale === REFERENCE_LOCALE) {
    continue;
  }

  const translations = loadLocale(locale);
  const keys = new Set(getKeys(translations));

  const missing = [...referenceKeys].filter((key) => !keys.has(key));

  const extra = [...keys].filter((key) => !referenceKeys.has(key));

  console.log(`${BOLD}${CYAN}── ${locale}.json${RESET}`);

  if (missing.length === 0 && extra.length === 0) {
    console.log(`   ${GREEN}✓ All keys match${RESET}\n`);

    continue;
  }

  if (missing.length > 0) {
    hasErrors = true;

    console.log(`   ${WHITE_ON_RED}${BOLD} Missing keys ${RESET}`);

    for (const key of missing) {
      console.log(`     ${RED}- ${key}${RESET}`);
    }

    console.log('');
  }

  if (extra.length > 0) {
    console.log(`   ${BLACK_ON_YELLOW}${BOLD} Keys only in ${locale}.json ${RESET}`);

    for (const key of extra) {
      console.log(`     ${YELLOW}+ ${key}${RESET}`);
    }

    console.log('');
  }
}

// ============================================================
// Result
// ============================================================

if (hasErrors) {
  console.log(`${WHITE_ON_RED}${BOLD} i18n check failed ${RESET}\n`);

  process.exit(1);
} else {
  console.log(`${WHITE_ON_GREEN}${BOLD} i18n check passed ${RESET}\n`);
}
