#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import Ajv2020 from "ajv/dist/2020.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMAS_DIR = path.join(__dirname, "..", "schemas");

function printUsage() {
  console.error("Usage: mova-validate --schema <schemaIdOrFile> <jsonFile1> [jsonFile2...]");
}

function loadSchemas(ajv) {
  const entries = fs
    .readdirSync(SCHEMAS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (!entries.length) {
    throw new Error("No schema files found in schemas/");
  }

  // Add schemas first to enable $id resolution
  for (const entry of entries) {
    const fullPath = path.join(SCHEMAS_DIR, entry);
    const raw = fs.readFileSync(fullPath, "utf8");
    const schema = JSON.parse(raw);
    ajv.addSchema(schema, schema.$id || pathToFileURL(fullPath).href);
  }
}

function resolveSchema(ajv, target) {
  const schemaById = ajv.getSchema(target);
  if (schemaById) {
    return schemaById;
  }

  const resolvedPath = path.resolve(target);
  if (fs.existsSync(resolvedPath) && resolvedPath.endsWith(".json")) {
    const url = pathToFileURL(resolvedPath).href;
    const schema = ajv.getSchema(url);
    if (schema) {
      return schema;
    }
    const raw = fs.readFileSync(resolvedPath, "utf8");
    const parsed = JSON.parse(raw);
    ajv.addSchema(parsed, parsed.$id || url);
    return ajv.getSchema(parsed.$id || url);
  }

  return null;
}

function main(argv) {
  const args = argv.slice(2);
  const schemaFlagIndex = args.indexOf("--schema");

  if (schemaFlagIndex === -1 || schemaFlagIndex === args.length - 1) {
    printUsage();
    process.exit(1);
  }

  const schemaRef = args[schemaFlagIndex + 1];
  const files = args.slice(schemaFlagIndex + 2);

  if (!files.length) {
    printUsage();
    process.exit(1);
  }

  const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: false });

  try {
    loadSchemas(ajv);
  } catch (err) {
    console.error(`Error loading schemas: ${err.message}`);
    process.exit(1);
  }

  const validator = resolveSchema(ajv, schemaRef);
  if (!validator) {
    console.error(`Schema not found: ${schemaRef}`);
    process.exit(1);
  }

  let toolError = false;
  let hasFailures = false;

  for (const filePath of files) {
    const absolute = path.resolve(filePath);
    if (!fs.existsSync(absolute)) {
      console.error(`FAIL ${filePath}`);
      console.error("  file not found");
      toolError = true;
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(absolute, "utf8"));
      const valid = validator(data);
      if (valid) {
        console.log(`PASS ${filePath}`);
      } else {
        hasFailures = true;
        console.log(`FAIL ${filePath}`);
        if (validator.errors?.length) {
          for (const err of validator.errors) {
            const loc = err.instancePath || "/";
            console.log(`  ${loc}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      hasFailures = true;
      console.log(`FAIL ${filePath}`);
      console.log(`  ${err.message}`);
    }
  }

  if (toolError) {
    process.exit(1);
  }

  if (hasFailures) {
    process.exit(2);
  }
}

try {
  main(process.argv);
} catch (err) {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
}
