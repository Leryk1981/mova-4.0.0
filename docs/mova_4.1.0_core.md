# MOVA 4.1.1 — Core Specification (Constitutional Draft)

> Canonical language of this specification: **English for text and identifiers** (`ds.*`, `env.*`, `global.*`, `verbs`).  
> All schema names, envelope types, roles and statuses are fixed in English.

## 1. Scope

**MOVA (Machine-Operable Verbal Actions)** is a language of machine-operable agreements about data and actions. It defines:

- which **data structures** exist in a given MOVA universe;
- which **operations (verbs)** are allowed on this data;
- which **envelopes (env.*)** encode concrete requests, commands and events;
- how **episodes of system work** are recorded as structured entries;
- how a shared **semantic layer (global.*)** ties these elements into a single vocabulary.

MOVA itself **never executes anything**. It contains no imperative code, control flow or runtime.  
All execution is delegated to external runtimes, services, agents and user interfaces.

MOVA 4.0.0 already introduced:

- data schemas (`ds.*`);
- envelopes (`env.*`);
- verbs (canonical operation types);
- episodes (records of work);
- global dictionaries (`global.*`).

MOVA 4.1.1 completes the **constitutional core** by adding:

- a standard **episode frame** (`ds.mova_episode_core_v1`);
- a minimal, extensible **security layer**:
  - security event episodes,
  - instruction profiles,
  - security dictionaries;
- clear **layering and namespace rules** (red core / skills / infra);
- **neutral contracts** for runtimes and connectors;
- a strict separation between **human-facing text** and **model instructions**.

This specification only defines **contracts** and **validation rules at system boundaries**.  
It does not define execution behaviour.

---

## 2. Core principles

### 2.1. MOVA does not execute

MOVA is not a runtime and not a programming language in the traditional sense. It:

- contains **no executable code**;
- does **not** define control flow, scheduling or concurrency;
- does **not** open sockets, write to storage or call external APIs.

Instead, MOVA defines:

- **data schemas** (`ds.*`);
- **envelopes** (`env.*`) as speech-acts over data;
- **verbs** as abstract operation types;
- **episodes** as structured records of what happened;
- **global dictionaries** as shared vocabulary.

Any executor (agent, worker, service, browser, CLI) that claims to “support MOVA” must:

- treat MOVA artefacts as **contracts**;
- validate input and output against the relevant schemas and envelopes;
- record work as episodes in compliance with the episode frame.

How exactly an executor runs code, handles retries, caching, failures or scaling is outside the scope of MOVA and belongs to **implementation**, not to the constitutional core.

### 2.2. Everything important is structured data

All meaningful artefacts in a MOVA system are structured JSON documents that conform to `ds.*` schemas:

- profiles;
- configurations;
- decisions;
- route results;
- episodes of work;
- security events.

Free text is allowed **inside fields**, but:

- there is always a **schema** describing where that text lives;
- the schema defines how the text relates to data and behaviour.

MOVA 4.1.1 standardises the **base form** of data schemas:

- `ds.mova_schema_core_v1.schema.json` — embedded via `allOf` into red core schemas.  
  It provides:
  - `schema_id` and optional `schema_version`;
  - `meta` — metadata for humans and tools;
  - `ext` — extension area for non-core metadata.

A strict rule is introduced:

- `meta` and `ext` **must not** contain direct execution instructions for AI models.

This is enforced conceptually by `global.text_channel_catalog_v1.json` and is expected to be enforced in tooling.

### 2.3. Verbs are operation types, not implementations

Verbs in MOVA are **names of operation types**, not function names and not method signatures.

Examples of canonical verbs:

- `create` — create a new record;
- `update` — update an existing record;
- `route` — produce a routing decision;
- `record` — record an episode or observation;
- `publish` — publish a catalog or configuration.

Each envelope (`env.*`) declares a single verb and specifies:

- which data types it accepts as input;
- which data types it produces as output.

Verbs do **not** prescribe algorithmic behaviour. They only define **what kind of action** is requested or reported.

Detailed verb descriptions and extension rules are provided in the dedicated verbs and global specification.

### 2.4. Envelopes are speech-acts over data

Envelopes (`env.*`) represent **speech-acts over data**: requests, commands, notifications, responses.

An envelope typically includes:

- `envelope_id` — envelope type (`env.something_v1`);
- `verb` — operation type (`create`, `update`, `route`, `record`, `publish`, …);
- `roles` — who is involved (sender, recipient, publisher, registry, producer, store, etc.);
- one or more payload fields referencing `ds.*` schemas;
- optional `meta` for technical metadata.

Examples in MOVA 4.1.1:

- `env.mova4_core_catalog_publish_v1` (verb `publish`) — publishing the MOVA core catalog to a registry;
- `env.instruction_profile_publish_v1` (verb `publish`) — publishing an instruction profile to an executor or guard;
- `env.security_event_store_v1` (verb `record`) — storing a security event episode in a security log.

Envelopes do not contain business logic. They are **typed containers** that give structured meaning to already defined data schemas and verbs.

### 2.5. Episodes record work as data

Episodes capture what happened in the system as **structured data**.

MOVA 4.1.1 defines:

- `ds.mova_episode_core_v1.schema.json` — base episode frame;
- `global.episode_type_catalog_v1.json` — core episode type dictionary;
- `ds.security_event_episode_core_v1.schema.json` — specialisation for security events.

The base episode includes:

- `episode_id` — unique identifier;
- `episode_type` — high-level type, e.g. `execution/file_cleanup`, `plan/task`, `security_event/prompt_injection_suspected`;
- `mova_version` — MOVA model version active when the episode was recorded;
- `recorded_at` — timestamp;
- `executor` — structured description of who executed the work (role, id, kind, environment);
- `result_status` and `result_summary` — outcome and short description;
- references to **input and output envelopes**, if applicable.

The dictionary `global.episode_type_catalog_v1.json` defines core ids:

- `execution` — execution episodes;
- `plan` — planning episodes;
- `security_event` — security-relevant events;
- `other` — other cases.

The recommended pattern is:

- `episode_type = "<core_id>[/<subtype>]"`.

Security events use a dedicated specialisation:

- `ds.security_event_episode_core_v1` extends the base episode with:
  - `security_event_type`, `security_event_category`;
  - `severity`;
  - `policy_profile_id`, `policy_ref`;
  - `security_model_version`;
  - `detection_source`, `detection_confidence`;
  - `recommended_actions`, `actions_taken`.

Episodes are recorded via envelopes, for example:

- `env.security_event_store_v1` with verb `record`.

### 2.6. Global is the semantic layer

The `global.*` family defines shared **dictionaries and vocabularies**.  

MOVA 4.1.1 recognises several key global catalogs:

- **Security catalog**  
  `global.security_catalog_v1.json` defines:
  - `security_event_type` — standard security event identifiers;
  - `security_action_type` — actions such as `log`, `alert`, `block`, `fallback`;
  - `security_policy_profile` — core profiles (`mova_security_default_v1`, `mova_security_dev_v1`), each with a `security_model_version`.

- **Episode type catalog**  
  `global.episode_type_catalog_v1.json` defines the core set of episode types (`execution`, `plan`, `security_event`, `other`) and the recommended format for subtypes.

- **Layers and namespaces**  
  `global.layers_and_namespaces_v1.json` defines:
  - layers:
    - `red_core` — constitutional core;
    - `skills` — domain skills and scenarios;
    - `infra` — runtimes and vendor bindings;
  - namespace rules and reserved prefixes for each layer.

- **Text channels**  
  `global.text_channel_catalog_v1.json` defines text channels:
  - `human_ui` — text shown to humans;
  - `model_instruction` — text for AI models only;
  - `system_log` — technical log text;
  - `mixed_legacy` — deprecated mixed channel.

Global catalogs provide a **common terminology** and constraints used by all schemas, envelopes and episodes.  
They do not contain execution logic.

### 2.7. MOVA lives at system boundaries

MOVA is designed to be applied at **system boundaries**:

- between user interfaces and backends;
- between services in a distributed system;
- between internal logic and external platforms;
- between agents and tools.

At these boundaries, MOVA defines:

- what is considered valid **input**;
- what is considered valid **output**;
- how **episodes** are recorded.

Inside a service or agent, any programming model is allowed, as long as:

- it respects MOVA contracts at the boundaries;
- it records episodes in compliance with the episode schemas.

---

## 3. Core primitives

### 3.1. Data schemas (`ds.*`)

Data schemas (`ds.*`) define the structure and validation rules for JSON documents used in MOVA.

Red core schemas must:

- extend `ds.mova_schema_core_v1` via `allOf`;
- define clear, machine-verifiable constraints;
- avoid embedding executable code or prompts.

Examples of red core schemas in MOVA 4.1.1:

- `ds.mova_schema_core_v1` — base form for ds-schemas;
- `ds.mova_episode_core_v1` — base episode frame;
- `ds.security_event_episode_core_v1` — security event episodes;
- `ds.instruction_profile_core_v1` — instruction and guardrail profiles;
- `ds.runtime_binding_core_v1` — neutral description of runtime bindings;
- `ds.connector_core_v1` — neutral description of connectors to external systems;
- `ds.ui_text_bundle_core_v1` — UI text bundles with explicit human/model channels.

Domain-specific schemas (for example `ds.smartlink_config_v1`) live in the **skills** or **product** layers, but may be referenced from catalogs and examples.

### 3.2. Verbs

Verbs are the **canonical operation types**. The core verb catalogue is small and stable.

Typical verbs include:

- `create`
- `update`
- `route`
- `record`
- `publish`

Each envelope:

- declares exactly one verb;
- lists which `ds.*` types it accepts or produces.

Extensions to the verb catalogue must:

- be documented in the verbs/global specification;
- remain general and not tied to a single product or vendor.

### 3.3. Envelopes (`env.*`)

Envelopes are **typed messages** that perform speech-acts over data. They:

- specify a single verb;
- describe roles (`publisher`, `registry`, `producer`, `security_store`, etc.);
- carry one or more payloads referencing `ds.*` schemas;
- optionally contain technical metadata.

Examples in MOVA 4.1.1:

- `env.mova4_core_catalog_publish_v1`
  - verb `publish`;
  - publishes the core catalog (`ds.mova4_core_catalog_v1`) to a registry.
- `env.instruction_profile_publish_v1`
  - verb `publish`;
  - publishes an instruction profile (`ds.instruction_profile_core_v1`) to an executor or guard.
- `env.security_event_store_v1`
  - verb `record`;
  - stores a security event episode (`ds.security_event_episode_core_v1`) in a security log.

Envelopes do not specify **how** an executor must handle a request or event; they only define the structured content and its meaning.

### 3.4. Episodes

Episodes (`ds.mova_episode_core_v1` and its specialisations) are:

- records of execution;
- records of planning;
- records of security events and policy evaluations.

They are not logs in the traditional string-based sense. They are **structured documents** that:

- can be validated;
- can be queried as data;
- can be aggregated into pattern or genetic memory layers.

MOVA 4.1.1 defines:

- the core episode frame;
- the security event specialisation;
- the episode type dictionary;
- envelopes used to store episodes.

Domain-specific episode schemas (for example, for task planning or file cleanup) must:

- extend the core frame;
- use `episode_type` values consistent with `global.episode_type_catalog_v1.json`.

---

## 4. Executors and boundaries

Executors are systems that:

- receive MOVA envelopes as input;
- perform work (using any internal implementation);
- produce envelopes and episodes as output.

MOVA 4.1.1 introduces neutral contracts for describing executors and external systems:

1. **Runtime binding core**

   - `ds.runtime_binding_core_v1.schema.json`

   Describes the relationship between MOVA artefacts and an execution runtime:

   - `runtime_id`, `runtime_kind` (`serverless`, `edge`, `browser`, `local_process`, …);
   - `language`, `runtime_version`;
   - `env_profile_id` (`dev`, `staging`, `prod`, …);
   - `binding_targets` — which templates, scenarios, skills or services are bound;
   - `capabilities` — descriptive flags for network, storage, secrets, queues.

   This schema is **descriptive only**. It does not define deployment or execution details.

2. **Connector core**

   - `ds.connector_core_v1.schema.json`

   Describes connectors to external systems:

   - `connector_id`;
   - `provider` (e.g. `openai`, `google`, `internal`);
   - `resource` (e.g. `chat`, `embeddings`, `calendar`);
   - `protocol` (`http`, `https`, `grpc`, `custom`);
   - `auth_methods` (types and descriptions);
   - optional `rate_limits`, `pagination`, `error_contract`.

   Vendor-specific connectors in the infra layer extend this core shape.

Executors are free to use any deployment and runtime technology, as long as they:

- honour MOVA contracts at input/output boundaries;
- record episodes consistently;
- respect instruction profiles and security policies where applicable.

---

## 5. Versioning

Versioning in MOVA 4.1.1 operates on several levels.

1. **MOVA core model version**

   - `mova_version` appears in episodes (`ds.mova_episode_core_v1` and derived schemas).
   - It indicates which version of the MOVA core model was active when the episode was recorded.

2. **Schema versions**

   - Every `ds.*` and `env.*` schema has an identifier (e.g. `ds.mova_episode_core_v1`) and may have a `schema_version` in its core form.
   - Backward-compatible changes should preserve the identifier and use semantic versioning where appropriate.
   - Breaking changes must use a new identifier (`*_v2`, `*_v3`, …).

3. **Security model version**

   - `security_model_version` is present in:
     - instruction profiles (`ds.instruction_profile_core_v1`);
     - security events (`ds.security_event_episode_core_v1`);
     - security profiles in `global.security_catalog_v1.json`.
   - It tracks evolution of the security model independently from the rest of MOVA.

4. **Core catalog version**

   - The core catalog (`ds.mova4_core_catalog_v1`) aggregates:
     - `data_types`;
     - `verbs`;
     - `envelopes`;
     - `episode_types`.
   - In MOVA 4.1.1, example catalog versions such as `4.1.0-core-draft-6` show the evolution of the catalog itself.
   - The catalog is published via `env.mova4_core_catalog_publish_v1`.

5. **Profiles and policies**

   - Instruction profiles have:
     - `profile_id`;
     - `profile_version`.
   - Security policy profiles in `global.security_catalog_v1.json` have:
     - `id`;
     - `security_model_version`.

Executors and tools should:

- validate documents against the appropriate schema version;
- interpret episodes, security events and instruction profiles in the context of their declared MOVA and security model versions.

---

# Applicability to MOVA 4.1.1

This is the reviewed 4.1.0 text for MOVA 4.1.1. The core structure, verbs, runtime/connector concepts remain valid; 4.1.1 only clarifies security/text/layers and adds the operator frame (see `MOVA_4.1.1_RELEASE_NOTES.md` and related docs).

---

This document defines the **constitutional core** of MOVA 4.1.1.  
All higher-level artefacts (domain skills, products, zero-code tools, MOVA-based experts and self-improvement layers) must treat this core as a stable contract and build on top of it without redefining or weakening its guarantees.
