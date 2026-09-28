// scripts/audit-design-system.cjs

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const EXTENSIONS = new Set([".css", ".tsx", ".ts", ".jsx", ".js"]);

const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === ".git"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
}

walk(SRC);

const relative = (file) => path.relative(ROOT, file).replaceAll("\\", "/");

const contents = new Map(
  files.map((file) => [file, fs.readFileSync(file, "utf8")])
);

// ------------------------------------------------------------
// DESIGN TOKENS
// ------------------------------------------------------------

const tokenValues = new Map();

for (const [file, content] of contents) {
  // Only match actual CSS custom-property declarations:
  // --foo: value;
  if (!file.endsWith(".css")) continue;

  const regex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}\n]+)\s*;/g;

  for (const match of content.matchAll(regex)) {
    const name = `--${match[1]}`;
    const value = match[2].trim();

    // Ignore Tailwind/internal variables
    if (name.startsWith("--tw-")) continue;

    if (!tokenValues.has(name)) {
      tokenValues.set(name, {
        value,
        file: relative(file),
      });
    }
  }
}

// ------------------------------------------------------------
// TOKEN REFERENCES
// ------------------------------------------------------------

const tokenReferences = new Map();

for (const [file, content] of contents) {
  const regex = /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,[^)]+)?\)/g;

  for (const match of content.matchAll(regex)) {
    const token = match[1];

    if (!tokenReferences.has(token)) {
      tokenReferences.set(token, []);
    }

    tokenReferences.get(token).push(relative(file));
  }
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function addOccurrence(map, value, file, line) {
  if (!map.has(value)) {
    map.set(value, []);
  }

  map.get(value).push(`${relative(file)}:${line}`);
}

function getLine(content, index) {
  return content.slice(0, index).split("\n").length;
}

function isDynamic(value) {
  return (
    value.includes("${") ||
    value.includes("calc(") ||
    value.includes("var(") ||
    value.includes("env(")
  );
}

// ------------------------------------------------------------
// COLORS
// ------------------------------------------------------------

const colors = new Map();

const colorRegex =
  /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

for (const [file, content] of contents) {
  for (const match of content.matchAll(colorRegex)) {
    const value = match[0];

    if (isDynamic(value)) continue;

    addOccurrence(
      colors,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// FONT FAMILIES
// ------------------------------------------------------------

const fontFamilies = new Map();

for (const [file, content] of contents) {
  const regex = /font-family\s*:\s*([^;}\n]+)/gi;

  for (const match of content.matchAll(regex)) {
    const value = match[1].trim();

    if (isDynamic(value)) continue;

    addOccurrence(
      fontFamilies,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// FONT SIZES
// ------------------------------------------------------------

const fontSizes = new Map();

for (const [file, content] of contents) {
  const regex = /font-size\s*:\s*([^;}\n]+)/gi;

  for (const match of content.matchAll(regex)) {
    const value = match[1].trim();

    if (isDynamic(value)) continue;

    addOccurrence(
      fontSizes,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// FONT WEIGHTS
// ------------------------------------------------------------

const fontWeights = new Map();

for (const [file, content] of contents) {
  const regex = /font-weight\s*:\s*([^;}\n]+)/gi;

  for (const match of content.matchAll(regex)) {
    const value = match[1].trim();

    if (isDynamic(value)) continue;

    addOccurrence(
      fontWeights,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// LINE HEIGHTS
// ------------------------------------------------------------

const lineHeights = new Map();

for (const [file, content] of contents) {
  const regex = /line-height\s*:\s*([^;}\n]+)/gi;

  for (const match of content.matchAll(regex)) {
    const value = match[1].trim();

    if (isDynamic(value)) continue;

    addOccurrence(
      lineHeights,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// SPACING
// ------------------------------------------------------------

const spacing = new Map();

for (const [file, content] of contents) {
  const regex =
    /(?:margin|margin-top|margin-right|margin-bottom|margin-left|padding|padding-top|padding-right|padding-bottom|padding-left|gap|row-gap|column-gap)\s*:\s*([^;}\n]+)/gi;

  for (const match of content.matchAll(regex)) {
    const value = match[1].trim();

    if (isDynamic(value)) continue;

    addOccurrence(
      spacing,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// BORDER RADIUS
// ------------------------------------------------------------

const borderRadius = new Map();

for (const [file, content] of contents) {
  const regex = /border-radius\s*:\s*([^;}\n]+)/gi;

  for (const match of content.matchAll(regex)) {
    const value = match[1].trim();

    if (isDynamic(value)) continue;

    addOccurrence(
      borderRadius,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// BOX SHADOW
// ------------------------------------------------------------

const boxShadows = new Map();

for (const [file, content] of contents) {
  const regex = /box-shadow\s*:\s*([^;}\n]+)/gi;

  for (const match of content.matchAll(regex)) {
    const value = match[1].trim();

    if (isDynamic(value)) continue;

    addOccurrence(
      boxShadows,
      value,
      file,
      getLine(content, match.index)
    );
  }
}

// ------------------------------------------------------------
// OUTPUT
// ------------------------------------------------------------

function printSection(title, map, tokens = false) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(title);
  console.log("=".repeat(70));

  if (map.size === 0) {
    console.log("None found.");
    return;
  }

  const sorted = [...map.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  for (const [value, locations] of sorted) {
    console.log(`\n${value} × ${locations.length}`);

    for (const location of [...new Set(locations)].slice(0, 10)) {
      console.log(`  ${location}`);
    }

    if (locations.length > 10) {
      console.log(`  ... ${locations.length - 10} more`);
    }
  }
}

// ------------------------------------------------------------
// EXISTING TOKENS
// ------------------------------------------------------------

console.log("\nDESIGN SYSTEM AUDIT V2");
console.log("======================");

console.log(`\nFiles scanned: ${files.length}`);
console.log(`CSS files: ${files.filter((f) => f.endsWith(".css")).length}`);
console.log(
  `TS/TSX/JS files: ${
    files.filter((f) => /\.(ts|tsx|js|jsx)$/.test(f)).length
  }`
);

console.log("\n" + "=".repeat(70));
console.log("EXISTING DESIGN TOKENS");
console.log("=".repeat(70));

const sortedTokens = [...tokenValues.entries()].sort(([a], [b]) =>
  a.localeCompare(b)
);

for (const [name, info] of sortedTokens) {
  const usage = tokenReferences.get(name)?.length || 0;

  console.log(
    `${name} = ${info.value} | defined: ${info.file} | used: ${usage}×`
  );
}

// ------------------------------------------------------------
// TOKEN USAGE
// ------------------------------------------------------------

console.log("\n" + "=".repeat(70));
console.log("TOKEN REFERENCES");
console.log("=".repeat(70));

const unusedTokens = [];

for (const [name, info] of sortedTokens) {
  const usage = tokenReferences.get(name)?.length || 0;

  if (usage === 0) {
    unusedTokens.push(name);
  }

  console.log(`${name} → ${usage} usage(s)`);
}

if (unusedTokens.length) {
  console.log("\nUnused tokens:");

  for (const token of unusedTokens) {
    console.log(`  ${token}`);
  }
}

// ------------------------------------------------------------
// RAW VALUES
// ------------------------------------------------------------

printSection("COLORS", colors);
printSection("FONT FAMILIES", fontFamilies);
printSection("FONT SIZES", fontSizes);
printSection("FONT WEIGHTS", fontWeights);
printSection("LINE HEIGHTS", lineHeights);
printSection("SPACING", spacing);
printSection("BORDER RADIUS", borderRadius);
printSection("BOX SHADOWS", boxShadows);

// ------------------------------------------------------------
// REPEATED VALUES
// ------------------------------------------------------------

function printCandidates(title, map, minimum = 2) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(title);
  console.log("=".repeat(70));

  const candidates = [...map.entries()]
    .filter(([value, locations]) => {
      return locations.length >= minimum && !value.includes("var(--");
    })
    .sort((a, b) => b[1].length - a[1].length);

  if (!candidates.length) {
    console.log("None.");
    return;
  }

  for (const [value, locations] of candidates) {
    console.log(`${value} → ${locations.length} occurrences`);
  }
}

printCandidates("REPEATED COLORS — TOKEN CANDIDATES", colors);
printCandidates("REPEATED FONT SIZES — TOKEN CANDIDATES", fontSizes);
printCandidates("REPEATED FONT WEIGHTS — TOKEN CANDIDATES", fontWeights);
printCandidates("REPEATED LINE HEIGHTS — TOKEN CANDIDATES", lineHeights);
printCandidates("REPEATED SPACING — TOKEN CANDIDATES", spacing);
printCandidates("REPEATED BORDER RADIUS — TOKEN CANDIDATES", borderRadius);
printCandidates("REPEATED BOX SHADOWS — TOKEN CANDIDATES", boxShadows);

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------

console.log("\n" + "=".repeat(70));
console.log("SUMMARY");
console.log("=".repeat(70));

console.log(`Design tokens: ${tokenValues.size}`);
console.log(`Token references: ${[...tokenReferences.values()].flat().length}`);

console.log(`Colors: ${colors.size} unique`);
console.log(`Font families: ${fontFamilies.size} unique`);
console.log(`Font sizes: ${fontSizes.size} unique`);
console.log(`Font weights: ${fontWeights.size} unique`);
console.log(`Line heights: ${lineHeights.size} unique`);
console.log(`Spacing: ${spacing.size} unique`);
console.log(`Border radius: ${borderRadius.size} unique`);
console.log(`Box shadows: ${boxShadows.size} unique`);

console.log("\nAudit complete.");