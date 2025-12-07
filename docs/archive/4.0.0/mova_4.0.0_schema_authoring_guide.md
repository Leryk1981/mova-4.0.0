# MOVA 4.0.0 — Schema Authoring Guide (`ds.*` and `env.*`)

> Audience: authors of MOVA schemas and the **MOVA expert** skill, which assists in creating and validating `ds.*` and `env.*` according to the MOVA 4.0.0 canon.

## 1. Purpose

This guide describes practical rules for:

- creating new data schemas (`ds.*`);
- creating new envelopes (`env.*`);
- choosing names, versions and links to `global.*` and verbs;
- making schemas suitable for long‑term use and automatic validation.

---

## 2. General principles

1. **Clear role of each schema**  
   Every schema should answer a concrete question: *which type of data or speech‑act does it describe?*

2. **Clear names and versions**  
   - Schema names (`ds.*`, `env.*`) should reflect content and version:  
     `ds.file_cleanup_plan_v1`, `env.mova_ai_bootstrap_generate_v1`.  
   - Suffix `_v1`, `_v2`, etc. is reserved for incompatible changes.

3. **JSON Schema as the base**  
   All MOVA schemas are based on JSON Schema (2020‑12) with explicit:
   - `type`,
   - `properties`,
   - `required`,
   - `additionalProperties`.

4. **Validation‑oriented design**  
   A schema should allow automated separation of valid and invalid data.  
   It is better to explicitly describe fields than to rely on loosely structured objects.

---

## 3. Authoring data schemas (`ds.*`)

### 3.1. When to create a new `ds.*` schema

Create a new data schema when:

- a new, clearly defined entity type appears (profile, plan, configuration, episode, etc.);
- an existing schema cannot be extended without breaking compatibility;
- a distinct lifecycle requires a separate schema (e.g. `*_draft`, `*_final`).

Avoid creating separate `ds.*` schemas for every minor variation differing by one or two fields — such differences are better expressed via optional fields, `oneOf` / `anyOf`, or parameters.

### 3.2. Structure of a `ds.*` schema

Recommended fields:

- `$id` — stable identifier (URI or logical ID);
- `title` — short English title;
- `description` — purpose description;
- `type` — usually `"object"`;
- `properties` — list of fields with types and descriptions;
- `required` — minimal set of required fields;
- `additionalProperties` — usually `false` to avoid unstructured “trash”;
- `examples` — one or more sample valid objects.

### 3.3. Linking to the global layer

If a schema uses roles, statuses or categories:

- prefer:
  - `enum` with clearly described values;
  - `$ref` to corresponding `ds.global_*` schemas;
  - explicit mention of the global dictionary in `description`.

This keeps terminology aligned and avoids local duplicates.

---

## 4. Authoring envelopes (`env.*`)

### 4.1. When to create a new `env.*` envelope

Create a new envelope when:

- a new speech‑act type appears: a different intent, participant set or result;
- the structure of a request / response changes in a way that cannot be modelled as a backwards‑compatible extension;
- a new scenario requires its own distinct act (for example “request plan”, “record episode”, “update configuration”).

### 4.2. Envelope structure

A typical envelope includes:

- `envelope_type` — full name (e.g. `env.file_cleanup_plan_request_v1`);
- `mova_version` — MOVA version (e.g. `4.0.0`);
- `verb` — verb describing intent (`plan`, `record`, `validate`, etc.);
- `roles` — object or array of roles (initiator, executor, result recipient), referencing `global.roles`;
- `data` — nested objects referencing `ds.*`:
  - `input`, `context`, `target`, `preferences`, etc.;
- `meta` — correlation IDs, timestamps, technical context.

An `env.*` schema is also a JSON Schema and must allow full validation of the envelope.

### 4.3. Choosing a verb for an envelope

When choosing `verb`:

- select a verb from the global verbs catalogue;
- if no suitable verb exists, then:
  - check whether an existing verb can be reused;
  - if not, prepare a new verb proposal (see verbs guide).

An envelope should not introduce ad‑hoc “local verbs” that are not understood elsewhere.

---

## 5. Versioning schemas

### 5.1. When a new version is required

Incompatible changes to a `ds.*` or `env.*` schema require a new version (e.g. `_v1` → `_v2`) when:

- required fields change or are removed;
- field types change (e.g. `string` → `object`);
- semantics of key fields changes.

Compatible changes (adding optional fields, clarifying descriptions, additional examples) can be made without bumping the version, but should be handled carefully.

### 5.2. Versioning principles

- never change the meaning of an already published version retrospectively;
- when a change is needed, create a new version and mark the old one as deprecated in docs, but do not rewrite it.

---

## 6. Examples

### 6.1. Example: `ds.file_cleanup_plan_v1`

- describes a directory cleanup plan: a list of actions `keep/delete/archive/ask`;  
- includes:
  - target directory metadata;
  - element list with proposed actions;
  - aggregate counters (how many items in each category).

### 6.2. Example: `env.file_cleanup_plan_request_v1`

- includes:
  - `target` — directory description;
  - `parameters` — planning rules and preferences;
  - intent — invoke the `plan` verb and obtain `ds.file_cleanup_plan_v1` as result.

These examples show how `ds.*` and `env.*` work as a pair:  
`ds.*` describes data shape, `env.*` describes the speech‑act in which the data is used.

---

## 7. Role of `MOVA expert` in schema authoring

The **MOVA expert** skill can:

- propose structures for new `ds.*` and `env.*` based on requirements;
- check:
  - adherence to general principles (names, versions, required fields);
  - consistency with `global.*` and verbs;
- suggest when a new version is needed vs. extending an existing schema;
- generate `examples` for schemas.

In this way, `MOVA expert` helps keep the language layer coherent and turns schema authoring into a repeatable, guided process rather than a series of ad‑hoc decisions.
