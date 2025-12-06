// tools/validate_all.js
// Simple validator for all MOVA JSON Schemas in schemas/ (draft 2020-12)

const fs = require("fs");
const path = require("path");

// Використовуємо версію Ajv з підтримкою JSON Schema 2020-12
const Ajv2020 = require("ajv/dist/2020");

// Створюємо екземпляр Ajv у режимі 2020-12
const ajv = new Ajv2020({
  allErrors: true,
  strict: false // щоб не отримувати зайві warning'и
});

/**
 * Рекурсивно збираємо всі *.schema.json у каталозі.
 */
function collectSchemaFiles(dir) {
  const result = [];

  if (!fs.existsSync(dir)) {
    return result;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectSchemaFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".schema.json")) {
      result.push(full);
    }
  }

  return result;
}

function main() {
  const rootDir = path.resolve(__dirname, "..");
  const schemasDir = path.join(rootDir, "schemas");

  if (!fs.existsSync(schemasDir)) {
    console.error("ERROR: schemas/ directory not found next to README.md");
    process.exit(1);
  }

  const schemaFiles = collectSchemaFiles(schemasDir);

  if (schemaFiles.length === 0) {
    console.warn("WARNING: no *.schema.json files found under schemas/");
    process.exit(0);
  }

  console.log(`Found ${schemaFiles.length} schema file(s).`);
  console.log("Validating...");

  let hasErrors = false;

  for (const file of schemaFiles) {
    const rel = path.relative(rootDir, file);
    let schema;

    try {
      const raw = fs.readFileSync(file, "utf8");
      schema = JSON.parse(raw);
    } catch (err) {
      hasErrors = true;
      console.error(`FAIL  ${rel}`);
      console.error("  JSON parse error:", err.message);
      continue;
    }

    try {
      ajv.compile(schema);
      console.log(`OK    ${rel}`);
    } catch (err) {
      hasErrors = true;
      console.error(`FAIL  ${rel}`);
      if (err.errors && Array.isArray(err.errors)) {
        const text = ajv.errorsText(err.errors, { separator: "\n  " });
        console.error("  Schema validation errors:\n  " + text);
      } else {
        console.error("  " + err.message);
      }
    }
  }

  if (hasErrors) {
    console.error("\nSome schemas failed validation.");
    process.exit(1);
  } else {
    console.log("\nAll schemas validated successfully.");
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
