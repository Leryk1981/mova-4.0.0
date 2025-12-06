# MOVA 4.0.0 — Machine-Operable Verbal Actions

**MOVA (Machine-Operable Verbal Actions)** is a language of machine-operable agreements about data and actions.

MOVA defines:

- which **data structures** exist in a system;
- which **operation types (verbs)** are allowed on this data;
- how **speech-acts** are encoded as envelopes (`env.*`);
- how **episodes of work** are recorded as structured data;
- how a shared **semantic layer (`global.*`)** keeps terminology consistent.

MOVA itself **never executes anything**. It contains no imperative code, no workflows and no runtime.

Execution (agents, services, workers, tools, user interfaces) always lives outside.  
Any executor that claims support for MOVA MUST treat it as a **contract**: what counts as valid input, valid output and a valid episode.

This repository publishes the **MOVA 4.0.0 core specification** and the corresponding JSON Schemas.

---

## Goals

MOVA 4.0.0 is intended to be:

- **Language-first**  
  Everything important is structured data that can be validated.

- **Runtime-agnostic**  
  The same contracts can be used with different agents, services and platforms.

- **Auditable**  
  Every meaningful step of work can be recorded as a structured episode.

- **Evolvable**  
  Schemas, verbs and envelopes can change under explicit, versioned rules.

---

## Core concepts

### Data schemas (`ds.*`)

Data schemas (`ds.*`) describe the structure and invariants of domain objects.

Each `ds.*` schema is a JSON Schema and defines:

- field types and constraints;
- required vs optional fields;
- allowed values (via enums, formats, references to `global.*`);
- examples of valid instances.

Schemas describe **what the data looks like**, not how it is processed.

---

### Verbs

Verbs describe **types of operations** on data and episodes.

They appear in:

- envelopes (`env.*`) — to express intent;
- episodes — to record what was actually done.

Examples (non-exhaustive):

- `create`, `update`, `delete`;
- `validate`, `route`;
- `record`, `aggregate`;
- `explain`, `plan`.

Verbs are **abstract operation types**, not technologies or endpoints.  
Different executors may implement the same verb in different ways, but they must honour the same input/output contracts.

---

### Envelopes (`env.*`)

Envelopes (`env.*`) are structured **speech-acts** over data: concrete requests, commands and events.

A typical envelope ties together:

- a `verb` (operation type);
- references to data schemas (`ds.*`);
- roles (who initiates, who executes, who receives the result);
- context and technical metadata.

Envelopes are the points where a human, a service and an AI agent can speak the same structured language.

---

### Global semantic layer (`global.*`)

The `global.*` family defines shared vocabularies:

- roles (participants: `user`, `agent`, `executor`, …);
- resources (`file_system`, `http_api`, …);
- statuses (`pending`, `completed`, `failed`, …);
- categories and event types.

This layer does not contain logic. It is a **semantic dictionary** used across `ds.*`, `env.*` and episodes to keep terminology consistent.

---

### Episodes (`ds.episode_*`)

Episodes are structured records of meaningful work steps.

An episode usually includes:

- identifiers and timestamps;
- references to input envelopes and data;
- executor identity and environment;
- result status and short summary;
- references to new or changed data;
- optional logs, metrics and explanations.

Episodes form the basis for:

- audit and reproducibility;
- analytics and optimisation;
- a “genetic layer” (pattern memory) built from many episodes.

---

## Repository contents

The intended layout of this repository is:

- **`README.md`**  
  This overview.

- **`docs/`** — human-readable specification documents:
  - `mova_4.0.0_core.md` — core language specification;
  - `mova_4.0.0_layers.md` — layered model (core / skills / products);
  - `mova_4.0.0_global_and_verbs.md` — global layer and verbs catalogue rules;
  - `mova_4.0.0_episodes_and_pattern_memory.md` — episodes and genetic layer;
  - `mova_4.0.0_schema_authoring_guide.md` — authoring guide for `ds.*` and `env.*`;
  - *(optional)* `mova_4.0.0_migration_from_3.6.md` — migration notes from 3.6.x.

- **`schemas/`** — machine-readable JSON Schemas:
  - `ds.*` — data schemas;
  - `env.*` — envelope schemas;
  - `ds.episode_*` and `ds.global_*` — episode and global reference schemas.

- **`examples/`** — sample JSON documents:
  - example `ds.*` instances;
  - example `env.*` envelopes.

- **`tools/`** *(optional but recommended)*:
  - simple scripts or instructions for validating all schemas and examples.

The exact directory names under `schemas/` and `examples/` may vary (`ds/`, `env/`, `global/`), but the intent is the same:  
specification in `docs/`, schemas in `schemas/`, reference examples in `examples/`.

---

## Getting started

### 1. Using MOVA schemas in your system

If you want to validate your JSON documents against MOVA 4.0.0:

1. Clone this repository.
2. Point your JSON Schema validator (e.g. AJV or any other) to the `schemas/` directory.
3. Validate your data against:
   - appropriate `ds.*` schemas for domain objects;
   - `env.*` schemas for envelopes at system boundaries;
   - `ds.episode_*` schemas for recorded episodes.

MOVA does not require any particular runtime.  
You are free to choose your own executors and infrastructure.

---

### 2. Validating schemas and examples

A typical validation setup looks like this:

- Use a JSON Schema validator (for example, [`ajv`](https://ajv.js.org/)) in a small script under `tools/`, or run it directly via CLI.
- Ensure that:
  - all files under `schemas/` are valid JSON Schemas;
  - all files under `examples/` validate against their corresponding schemas.

Example (Node.js + `ajv-cli`, assuming you install it locally or globally):

```bash
# Validate all schemas (example command)
ajv validate -s schemas/**/*.schema.json

# Validate an example file against a specific schema
ajv validate -s schemas/ds.example_schema_v1.schema.json -d examples/ds.example_schema_v1.instance.json
You can also add a small script in tools/ (e.g. tools/validate_all.sh or a Node.js script) and document its usage there.

3. Authoring new schemas and envelopes
If you want to define new types in the MOVA style:

Read:

docs/mova_4.0.0_core.md

docs/mova_4.0.0_schema_authoring_guide.md

docs/mova_4.0.0_global_and_verbs.md

Follow these rules:

use ds.* for data structures and env.* for speech-acts;

choose clear names with explicit version suffixes (*_v1, *_v2, …);

reuse global.* vocabularies where possible;

pick verbs from the shared verbs catalogue, or propose new verbs with clear semantics.

Provide examples for each new schema to make validation and onboarding easier.

4. Integrating with executors and skills
This repository does not ship any executors or skills.

To integrate MOVA into a real system, you will typically:

Implement skills that:

accept MOVA envelopes and data (env.*, ds.*);

perform real operations (API calls, file operations, computation, routing);

emit new data and episodes that conform to MOVA schemas.

Use MOVA schemas strictly at system boundaries:

between users and services;

between services and agents;

when recording episodes for audit and analysis.

Keep the MOVA core read-only from the perspective of executors:
executors must adapt to MOVA, not rewrite it on the fly.

Governance
This repository is the canonical specification of MOVA 4.0.0, maintained by the original author.

The core language (schemas, envelopes, global layer, verbs and normative documents in docs/) is a single-author spec.

Feedback and questions are welcome via GitHub Issues.

Pull Requests that change the core language (schemas, envelopes, global layer, verbs, or normative spec documents) are not accepted at this stage.

Contributions to examples, tooling and non-normative notes are welcome.

MOVA and the MOVA 4.0.0 specification were originally created and are maintained by Sergii Miasoiedov.

License
The MOVA 4.0.0 specification and JSON Schemas in this repository are licensed under the
Apache License, Version 2.0.

You are free to use the specification and schemas in both commercial and non-commercial
projects under the terms of this license.

The canonical MOVA 4.0.0 language definition is maintained in this repository by the
original author, Sergii Miasoiedov. Commercial offerings around MOVA (tools, services,
templates, certification, etc.) are provided separately and are not covered by this license.