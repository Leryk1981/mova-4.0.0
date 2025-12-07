# MOVA 4.1.0 — Machine-Operable Verbal Actions (Core Specification)

**MOVA (Machine-Operable Verbal Actions)** is a language of machine-operable agreements about data and actions.

MOVA defines:

- which **data structures** exist in a system;
- which **operation types (verbs)** are allowed on this data;
- how **speech-acts** are encoded as envelopes (`env.*`);
- how **episodes of work** are recorded as structured data;
- how a shared **semantic layer (`global.*`)** keeps terminology consistent;
- how **security**, **text/UI**, and **runtime/connector** contracts are expressed in a vendor-neutral way.

MOVA itself **never executes anything**. It contains no imperative code, no workflows and no runtime.

Execution (agents, services, workers, tools, user interfaces) always lives outside.  
Any executor that claims support for MOVA MUST treat it as a **contract**: what counts as valid input, valid output and a valid episode.

This repository publishes the **MOVA 4.1.0 core specification** and the corresponding JSON Schemas.

> Previous textual specs for MOVA 4.0.0 are preserved in `docs/archive/4.0.0/` for historical reference.  
> MOVA 4.1.0 is the canonical version going forward.

---

## Goals

MOVA 4.1.0 is intended to be:

- **Language-first**  
  Everything important is structured data that can be validated.

- **Runtime-agnostic**  
  The same contracts can be used with different agents, services and platforms.

- **Auditable**  
  Every meaningful step of work can be recorded as a structured episode.

- **Evolvable**  
  Schemas, verbs, envelopes and catalogs change under explicit, versioned rules.

- **Security-aware**  
  Policies, guardrails and security events are first-class data, not ad-hoc code.

---

## Core concepts

### Data schemas (`ds.*`)

Data schemas (`ds.*`) describe the structure and invariants of domain objects and core language artefacts.

Each `ds.*` schema is a JSON Schema (draft 2020-12) and defines:

- field types and constraints;
- required vs optional fields;
- allowed values (via enums, formats, references to `global.*`);
- examples of valid instances (where applicable).

Schemas describe **what the data looks like**, not how it is processed.

Among them, MOVA 4.1.0 defines several **red core** schemas:

- `ds.mova_schema_core_v1` — core language for schemas themselves;
- `ds.mova_episode_core_v1` — core episode frame;
- `ds.security_event_episode_core_v1` — core security event episode;
- `ds.instruction_profile_core_v1` — core instruction profile (policies and guardrails);
- `ds.runtime_binding_core_v1` — runtime binding core;
- `ds.connector_core_v1` — connector core;
- `ds.ui_text_bundle_core_v1` — UI text bundle core;
- `ds.mova4_core_catalog_v1` — core catalog model for MOVA itself.

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
- `explain`, `plan`, `analyze`, `summarize`.

Verbs are **abstract operation types**, not technologies or endpoints.  
Different executors may implement the same verb in different ways, but they must honour the same input/output contracts.

The canonical verb catalogue and rules for introducing new verbs are described in:

- `docs/mova_4.1.0_global_and_verbs.md`
- `global.*` catalogs.

---

### Envelopes (`env.*`)

Envelopes (`env.*`) are structured **speech-acts** over data: concrete requests, commands and events.

A typical envelope ties together:

- a `verb` (operation type);
- references to data schemas (`ds.*`);
- roles (who initiates, who executes, who receives the result);
- context and technical metadata.

Envelopes are the points where a human, a service and an AI agent can speak the same structured language.

In MOVA 4.1.0, core envelopes include:

- `env.mova4_core_catalog_publish_v1` — publishing the core catalog;
- `env.instruction_profile_publish_v1` — publishing instruction profiles;
- `env.security_event_store_v1` — storing security event episodes.

The general design of envelopes and their relation to verbs and roles is covered in:

- `docs/mova_4.1.0_core.md`
- `docs/mova_4.1.0_global_and_verbs.md`.

---

### Global semantic layer (`global.*`)

The `global.*` family defines shared vocabularies:

- roles (participants: `user`, `agent`, `executor`, …);
- resources (`file_system`, `http_api`, …);
- statuses (`pending`, `completed`, `failed`, …);
- categories and event types;
- security event and action types;
- episode types;
- text channels.

This layer does not contain logic. It is a **semantic dictionary** used across:

- `ds.*` schemas,
- `env.*` envelopes,
- episodes and security events,

to keep terminology consistent.

MOVA 4.1.0 introduces, among others:

- `global.episode_type_catalog_v1.json`
- `global.security_catalog_v1.json`
- `global.layers_and_namespaces_v1.json`
- `global.text_channel_catalog_v1.json`

---

### Episodes and the genetic layer

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

MOVA 4.1.0 defines:

- a core episode frame: `ds.mova_episode_core_v1`;
- a core security event episode: `ds.security_event_episode_core_v1`;
- episode type catalogs: `global.episode_type_catalog_v1.json`.

The conceptual model is described in:

- `docs/mova_4.1.0_episodes_and_genetic_layer.md`.

---

### Security layer

The security layer is part of the red core and covers:

- **instruction profiles** — declarative policies and guardrails:
  - `ds.instruction_profile_core_v1`
  - `env.instruction_profile_publish_v1`
- **security events** — structured security episodes:
  - `ds.security_event_episode_core_v1`
  - `env.security_event_store_v1`
- **security catalogs**:
  - `global.security_catalog_v1.json`
- **model versioning**:
  - `security_model_version` to track which security model a profile or event uses.

This layer is described in detail in:

- `docs/mova_4.1.0_security_layer.md`.

---

### Text and UI layer

The text/UI layer formalises the separation between:

- **human-facing UI text** (`human_ui`);
- **model instructions** (`model_instruction`);
- **system logs** (`system_log`).

Core artefacts:

- `global.text_channel_catalog_v1.json` — text channel definitions and rules;
- `ds.ui_text_bundle_core_v1` — UI text bundle schema.

The design ensures that:

- prompts and model instructions do not leak via human UI text;
- UI copy and model instructions can be audited and evolved separately;
- text is treated as structured data.

Details are provided in:

- `docs/mova_4.1.0_text_and_ui_layer.md`.

---

### Runtime and connectors

MOVA itself does not execute code, but the core must describe **where** and **how** execution happens.

Core schemas:

- `ds.runtime_binding_core_v1` — runtime binding core:
  - runtime ids, kinds, environment profiles, capabilities;
- `ds.connector_core_v1` — connector core:
  - provider, resource, protocol, auth methods, rate limits, error contracts.

Concrete runtimes and connectors live in the infra layer as schemas that extend these cores.  
The contracts and their role in the layered model are described in:

- `docs/mova_4.1.0_runtime_and_connectors.md`.

---

## Repository contents

The intended layout of this repository is:

- **`README.md`**  
  This overview.

- **`docs/`** — human-readable specification documents for MOVA 4.1.0:
  - `mova_4.1.0_core.md` — core language specification;
  - `mova_4.1.0_global_and_verbs.md` — global layer and verb catalogue rules;
  - `mova_4.1.0_episodes_and_genetic_layer.md` — episodes and genetic layer;
  - `mova_4.1.0_layers_and_namespaces.md` — layered model and namespaces;
  - `mova_4.1.0_security_layer.md` — security layer (instruction profiles and security events);
  - `mova_4.1.0_text_and_ui_layer.md` — text channels and UI bundles;
  - `mova_4.1.0_runtime_and_connectors.md` — runtime/connector core contracts;
  - `archive/4.0.0/` — frozen MOVA 4.0.0 documents (non-canonical).

- **`schemas/`** — machine-readable JSON Schemas (JSON Schema draft 2020-12):
  - `ds.mova_schema_core_v1.schema.json`
  - `ds.mova_episode_core_v1.schema.json`
  - `ds.security_event_episode_core_v1.schema.json`
  - `ds.instruction_profile_core_v1.schema.json`
  - `ds.runtime_binding_core_v1.schema.json`
  - `ds.connector_core_v1.schema.json`
  - `ds.ui_text_bundle_core_v1.schema.json`
  - `ds.mova4_core_catalog_v1.schema.json`
  - `env.mova4_core_catalog_publish_v1.schema.json`
  - `env.instruction_profile_publish_v1.schema.json`
  - `env.security_event_store_v1.schema.json`

- **`examples/`** — sample JSON documents (optional / to be extended):
  - example `ds.*` instances;
  - example `env.*` envelopes;
  - example episodes.

- **`tools/`** — validation tooling:
  - `tools/validate_all.js` — Node.js script that validates all schemas with Ajv (draft 2020-12).

---

## Getting started

### 1. Using MOVA schemas in your system

If you want to validate your JSON documents against MOVA 4.1.0:

1. Clone this repository.
2. Point your JSON Schema validator (e.g. Ajv or any other) to the `schemas/` directory.
3. Validate your data against:
   - appropriate `ds.*` schemas for domain and core objects;
   - `env.*` schemas for envelopes at system boundaries;
   - episode schemas for recorded episodes and security events.

MOVA does not require any particular runtime.  
You are free to choose your own executors and infrastructure, as long as they respect these contracts.

---

### 2. Validating schemas

This repository includes a Node.js validation script based on Ajv (draft 2020-12).

Prerequisites:

- Node.js
- npm

Install dependencies and generate/update the lockfile:

```bash
npm install --package-lock-only
Run the validation script:

bash
Копировать код
npm test
# or
npm run test
This will:

load all JSON Schemas from schemas/,

register them in Ajv (so $ref by $id works),

validate each schema as a JSON Schema draft 2020-12 document.

If needed, you can add your own scripts or CLIs on top of this.

3. Authoring new schemas and envelopes
If you want to define new types in the MOVA style:

Read:

docs/mova_4.1.0_core.md

docs/mova_4.1.0_global_and_verbs.md

docs/mova_4.1.0_schema_authoring_guide.md (when added, or follow the patterns in existing schemas)

Follow these rules:

use ds.* for data structures and env.* for speech-acts;

choose clear names with explicit version suffixes (*_v1, *_v2, …);

reuse global.* vocabularies where possible;

pick verbs from the shared verb catalogue, or propose new verbs with clear semantics and documentation;

avoid embedding executable logic or model prompts inside schemas; keep them as neutral contracts.

Provide examples for each new schema to make validation and onboarding easier.

4. Integrating with executors and skills
This repository does not ship any executors or domain skills.

To integrate MOVA into a real system, you will typically:

Implement skills that:

accept MOVA envelopes and data (env.*, ds.*);

perform real operations (API calls, file operations, computation, routing);

emit new data and episodes that conform to MOVA schemas.

Use MOVA schemas strictly at system boundaries:

between users and services;

between services and agents;

when recording episodes and security events for audit and analysis.

Treat the MOVA core as read-only from the executor’s point of view:

executors must adapt to MOVA, not rewrite it on the fly.

Versioning and migration
MOVA 4.1.0 is the canonical core spec in this repository.

MOVA 4.0.0 documents have been moved to docs/archive/4.0.0/ and are frozen.

All schemas in schemas/ use JSON Schema draft 2020-12.

Future breaking changes to core schemas will use new ids (for example *_v2), not silent changes to existing ids.

If you are migrating from earlier versions (including 4.0.0), use:

docs/mova_4.1.0_core.md

docs/mova_4.1.0_episodes_and_genetic_layer.md

docs/mova_4.1.0_security_layer.md

docs/mova_4.1.0_runtime_and_connectors.md

as the normative reference points.

Governance
This repository is the canonical specification of MOVA 4.1.0, maintained by the original author.

The core language (schemas, envelopes, global layer, verbs and normative documents in docs/) is a single-author spec.

Feedback and questions are welcome via GitHub Issues.

Pull Requests that change the core language (schemas, envelopes, global layer, verbs, or normative spec documents) may be discussed, but acceptance is at the discretion of the author.

Contributions to examples, tooling and non-normative notes are welcome.

MOVA and the MOVA 4.1.0 specification were originally created and are maintained by Sergii Miasoiedov.

License
The MOVA 4.1.0 specification and JSON Schemas in this repository are licensed under the Apache License, Version 2.0.

You are free to use the specification and schemas in both commercial and non-commercial projects under the terms of this license.

The canonical MOVA 4.1.0 language definition is maintained in this repository by the original author.
Commercial offerings around MOVA (tools, services, templates, certification, etc.) are provided separately and are not covered by this license.