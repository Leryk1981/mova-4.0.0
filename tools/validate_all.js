#!/usr/bin/env node

// MOVA 4.1.0 core schema validator (JSON Schema draft 2020-12)

const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020");

const ajv = new Ajv2020({
  strict: false,
  allErrors: true,
  validateFormats: false // не лаятись на "date-time" без ajv-formats
});

const SCHEMAS_DIR = path.join(__dirname, "..", "schemas");

// 1. Збираємо всі файли схем
let files = fs
  .readdirSync(SCHEMAS_DIR)
  .filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  console.error("No schema files found in 'schemas/'.");
  process.exit(1);
}

// Пріоритетні базові схеми (мають бути додані першими)
const priority = [
  "ds.mova_schema_core_v1.schema.json",
  "ds.mova_episode_core_v1.schema.json",
  "ds.security_event_episode_core_v1.schema.json"
];

files.sort((a, b) => {
  const ia = priority.indexOf(a);
  const ib = priority.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
});

console.log(`Found ${files.length} schema file(s).`);

const schemas = new Map();

// 2. Читаємо і парсимо всі схеми
for (const file of files) {
  const fullPath = path.join(SCHEMAS_DIR, file);
  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    const schema = JSON.parse(raw);
    schemas.set(file, schema);
  } catch (err) {
    console.error(`FAIL  schemas\\${file}`);
    console.error(`  cannot read or parse JSON: ${err.message}`);
    process.exitCode = 1;
  }
}

// 3. Спочатку реєструємо всі схеми в Ajv, щоб $ref за $id могли резолвитись
for (const [file, schema] of schemas) {
  try {
    ajv.addSchema(schema);
  } catch (err) {
    console.error(`FAIL  schemas\\${file}`);
    console.error(`  can't add schema: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("Validating...");

let hasErrors = false;

// 4. Валідатуємо кожну схему окремо
for (const [file, schema] of schemas) {
  try {
    const valid = ajv.validateSchema(schema);
    if (valid) {
      console.log(`OK    schemas\\${file}`);
    } else {
      hasErrors = true;
      console.log(`FAIL  schemas\\${file}`);
      if (ajv.errors && ajv.errors.length) {
        for (const err of ajv.errors) {
          const loc = err.instancePath || err.schemaPath || "";
          console.log(`  ${loc}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    hasErrors = true;
    console.log(`FAIL  schemas\\${file}`);
    console.log(`  ${err.message}`);
  }
}

if (hasErrors) {
  console.log("\nSome schemas failed validation.");
  process.exit(1);
} else {
  console.log("\nAll schemas validated successfully.");
}
