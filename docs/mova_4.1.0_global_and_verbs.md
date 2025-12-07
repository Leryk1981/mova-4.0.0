# MOVA 4.1.0 — Global Layer and Verbs (`global.*` and verbs)

> Audience: authors of MOVA schemas and skills, and MOVA-based tools and experts that maintain catalogs, dictionaries and verbs.

This document describes the **global layer** (`global.*`) and the **verb catalogue** for MOVA 4.1.0.

It is aligned with the MOVA 4.1.0 core specification and the following schemas and catalogs in the repository:

- `ds.mova_schema_core_v1.schema.json`
- `ds.mova_episode_core_v1.schema.json`
- `ds.security_event_episode_core_v1.schema.json`
- `ds.instruction_profile_core_v1.schema.json`
- `ds.runtime_binding_core_v1.schema.json`
- `ds.connector_core_v1.schema.json`
- `ds.ui_text_bundle_core_v1.schema.json`
- `ds.mova4_core_catalog_v1.schema.json`
- `global.security_catalog_v1.json`
- `global.episode_type_catalog_v1.json`
- `global.layers_and_namespaces_v1.json`
- `global.text_channel_catalog_v1.json`
- `mova4_core_catalog.example.json`
- `env.mova4_core_catalog_publish_v1.example.json`

---

## 1. Purpose of the global layer (`global.*`)

The global layer (`global.*`) is MOVA’s **semantic reference layer**.  
Its purpose is to provide a stable shared vocabulary for:

- data schemas (`ds.*`);
- envelopes (`env.*`);
- episodes;
- tools and executors that operate on MOVA artefacts.

Typical `global.*` catalogs include:

- role dictionaries;
- resource dictionaries;
- status dictionaries;
- category dictionaries;
- security dictionaries;
- text-channel dictionaries;
- episode-type dictionaries;
- layer and namespace maps.

The global layer is:

- **vendor-neutral** — it does not depend on a specific platform or product;
- **shared** — the same values are reused across many schemas and envelopes;
- **stable** — changes are done via versioning and deprecation, not by rewriting meaning.

Global catalogs are regular JSON documents that can be:

- validated;
- versioned;
- published using MOVA envelopes (for example, as part of the core catalog).

---

## 2. Global catalogs stabilised in MOVA 4.1.0

MOVA 4.1.0 stabilises a set of core `global.*` catalogs that are part of the constitutional red core.

### 2.1. Security catalog

**File:** `global.security_catalog_v1.json`

This catalog defines the core vocabulary for the security layer:

- `security_event_type`  
  Standard identifiers for types of security events, for example:
  - `instruction_profile_invalid`
  - `prompt_injection_suspected`
  - `forbidden_tool_requested`
  - `rate_limit_exceeded`
  - `sensitive_data_access_suspected`
  - `other`

- `security_action_type`  
  Standard identifiers for security actions, for example:
  - `log`
  - `alert`
  - `block`
  - `fallback`

- `security_policy_profile`  
  Named policy profiles with explicit `security_model_version`, for example:
  - `mova_security_default_v1`
  - `mova_security_dev_v1`

These values are used primarily in:

- `ds.security_event_episode_core_v1` (for `security_event_type`, `severity`, `recommended_actions`, `actions_taken`);
- `ds.instruction_profile_core_v1` (for `on_violation` actions and profile identifiers).

The security catalog is part of the **red core** and must remain vendor-neutral.

### 2.2. Episode type catalog

**File:** `global.episode_type_catalog_v1.json`

This catalog defines the **core episode types** used in the MOVA episode frame:

- `execution` — episodes that record actual execution of work;
- `plan` — episodes that record plans or strategies;
- `security_event` — episodes that record security events and policy decisions;
- `other` — episodes that do not fit the previous categories.

The recommended format is:

- `episode_type = "<core_id>[/<subtype>]"`

Examples:

- `execution/file_cleanup`
- `execution/smartlink_route`
- `plan/task`
- `security_event/prompt_injection_suspected`
- `other/analysis`

This format is used in:

- `ds.mova_episode_core_v1.schema.json` (base episodes);
- `ds.security_event_episode_core_v1.schema.json` (security events).

Domain-specific episode schemas **must** respect this format and reuse core ids where possible.

### 2.3. Layers and namespaces catalog

**File:** `global.layers_and_namespaces_v1.json`

This catalog defines the **layering model** and **namespace rules** for MOVA:

Layers:

- `red_core`  
  Constitutional core of MOVA. Contains only vendor-neutral:
  - `ds.*` schemas;
  - `env.*` envelopes;
  - `global.*` dictionaries;
  - core verbs.

- `skills`  
  Domain skills and scenarios built on top of the red core:
  - file cleanup;
  - smartlink and routing;
  - social benefits;
  - e-commerce templates;
  - other domain packages.

- `infra`  
  Runtime and vendor bindings:
  - connectors to external APIs and services;
  - runtime-specific configurations and profiles.

Namespace rules define:

- which prefixes are reserved for red core schemas (for example `mova`, `mova4`, `security`, `runtime_core`, `connector_core`);
- how skills must choose their own prefixes (for example `file_cleanup`, `task_planning`, `social`, `ecommerce`, …);
- how infra-level schemas should be named (for example `ds.connector_openai_chat_v1`, `ds.runtime_cloudflare_worker_v1`).

The purpose of this catalog is to:

- prevent accidental mixing of red core and domain-specific names;
- make it obvious, from the identifier, to which layer a schema belongs.

### 2.4. Text channels catalog

**File:** `global.text_channel_catalog_v1.json`

This catalog defines **text channels** and rules for how text is used in MOVA:

Channels:

- `human_ui`  
  Text shown directly to human users in interfaces (questions, explanations, hints, messages).

- `model_instruction`  
  Text directed to AI models as instructions or guidance, not shown to end users.

- `system_log`  
  Technical log messages and diagnostics, not used as prompts.

- `mixed_legacy`  
  Legacy mixed channel where human text and model instructions are not clearly separated. Marked as `deprecated` and intended only for migration.

Rules include:

- `no_llm_instructions_in_meta_ext`  
  `meta` and `ext` fields in `ds.*` must not contain direct execution instructions for AI models.

- `human_ui_must_not_contain_llm_instructions`  
  Text in `human_ui` must not be used as prompts for models.

- `model_instruction_not_shown_to_user`  
  Text in `model_instruction` must never be shown directly to end users.

These rules are enforced structurally via:

- `ds.ui_text_bundle_core_v1.schema.json`, which separates `human_text` and `model_text` and binds each to a specific channel.

### 2.5. Other global catalogs

In addition to the catalogs above, MOVA installations may define further `global.*` catalogs, for example:

- `global.roles_catalog_v1.json` — roles of actors and services;
- `global.status_catalog_v1.json` — standard status values;
- `global.resource_catalog_v1.json` — named resources.

These catalogs:

- are part of the **global semantic layer**;
- must remain vendor-neutral at the red core level;
- may be extended or specialised in **skills** and **infra** layers.

---

## 3. Design principles for `global.*`

The following principles apply to all `global.*` catalogs in MOVA 4.1.0.

### 3.1. Consistency

A given global identifier must mean the same thing wherever it appears.

- If a role `requester` is defined in a global roles catalog, then all schemas that use this role should refer to that definition.
- If `security_event_type = "prompt_injection_suspected"` appears in multiple schemas, its meaning is defined once, in `global.security_catalog_v1.json`.

### 3.2. Small but stable vocabularies

Global vocabularies should be:

- small enough to understand and reason about;
- stable across time and products;
- carefully extended only when necessary.

Avoid:

- many near-duplicate values with slightly different wording;
- product-specific terms at the red core level.

### 3.3. Versioning instead of rewriting

If the meaning of a global value must change, do not silently rewrite its definition.

Instead:

- introduce a new value (for example `role:operator_v2`);
- mark the old value as deprecated in the catalog;
- keep old episodes and schemas interpretable in terms of the original meaning.

### 3.4. Schema integration

Global values should be integrated into schemas via:

- `enum` fields that list allowed values;
- explicit references in descriptions (for example, “see `global.security_catalog_v1.json`”);
- constraints that ensure that ids conform to the global catalog.

This keeps `ds.*`, `env.*`, `global.*` and episodes aligned.

### 3.5. Separation of red core and domain globals

Red core global catalogs must remain:

- vendor-neutral;
- minimal;
- generally applicable.

Domain-specific or vendor-specific catalogs (for example for particular industries or platforms) must live in:

- `skills` layer (domain-level globals);
- `infra` layer (vendor-level globals).

---

## 4. Verbs in MOVA 4.1.0

### 4.1. Purpose of verbs

Verbs describe **types of operations** on data and episodes.  
They are used in:

- envelopes (`env.*`) — to express intent;
- episodes — to describe what was actually done.

Verbs are **semantic labels**, not implementations.  
They say **what kind of action** is requested or recorded, not how to perform it.

### 4.2. Core verb set

MOVA 4.1.0 stabilises the following core verbs in the red core:

- `create`  
  Create a new record.

- `update`  
  Update an existing record.

- `route`  
  Produce a routing decision (for example, decide where to send a request or click).

- `record`  
  Record an episode or observation.

- `publish`  
  Publish a catalog, profile or configuration to a registry or executor.

These verbs appear in:

- `mova4_core_catalog.example.json` (core catalog);
- example envelopes, such as:
  - `env.mova4_core_catalog_publish_v1` (verb `publish`);
  - `env.instruction_profile_publish_v1` (verb `publish`);
  - `env.security_event_store_v1` (verb `record`);
  - domain envelopes such as `env.smartlink_route_decision_v1` (verb `route`).

### 4.3. Verbs in envelopes

Every envelope (`env.*`) declares exactly one verb:

- `verb` field is a single string value from the verb catalogue;
- `envelope_id` identifies the envelope type;
- `roles` describe who is acting and who receives the result;
- payload fields (`catalog`, `profile`, `event`, etc.) reference `ds.*` schemas.

Examples:

- `env.mova4_core_catalog_publish_v1`  
  - `verb = "publish"`  
  - roles: `publisher`, `registry`  
  - payload: `catalog` (`ds.mova4_core_catalog_v1`).

- `env.security_event_store_v1`  
  - `verb = "record"`  
  - roles: `producer`, `security_store`  
  - payload: `event` (`ds.security_event_episode_core_v1`).

Verbs in envelopes express **what is requested or reported**, not how an executor must react.

### 4.4. Verbs in episodes

Episodes record what actually happened.  
They are not limited to a single verb, but **reference envelopes** and use `episode_type` and result fields to describe outcomes.

Typical patterns:

- an episode with `episode_type = "execution/..."` will often relate to envelopes with verbs such as `create`, `update`, `route`, `publish`;
- security event episodes (`episode_type = "security_event/..."`) often correspond to envelopes that were blocked, modified or logged due to security policies.

Verbs and episodes together provide:

- a description of intent (`verb` in envelopes);
- a description of what actually took place (`episode_type`, `result_status`, `result_summary` in episodes).

### 4.5. Extending the verb catalogue

New verbs may be introduced when:

- multiple products and schemas need the same operation type;
- an operation cannot be expressed clearly in terms of existing verbs;
- the operation is general enough to be useful beyond a single domain.

When proposing a new verb:

1. Check that existing verbs cannot reasonably cover the intended semantic.
2. Describe the new verb in terms of:
   - what it does conceptually;
   - what kinds of envelopes and episodes will use it;
   - how it differs from existing verbs.
3. Add the new verb to the global verb catalogue (or a dedicated global section for verbs), marking:
   - name (identifier);
   - description;
   - status (`draft`, `stable`, `deprecated`).

If semantics of a verb would need to change in a breaking way:

- introduce a new verb identifier;
- mark the old verb as `deprecated`;
- do not retroactively change its meaning.

---

## 5. Interaction between `global.*`, verbs and core catalog

The **core catalog**:

- `ds.mova4_core_catalog_v1.schema.json`
- `mova4_core_catalog.example.json`
- `env.mova4_core_catalog_publish_v1.*`

ties together:

- `data_types` — references to core `ds.*` schemas;
- `verbs` — verb identifiers and descriptions;
- `envelopes` — envelope ids, verbs, input and output types;
- `episode_types` — links to episode type schemas.

The catalog is published using:

- `env.mova4_core_catalog_publish_v1` with verb `publish`.

In MOVA 4.1.0, the catalog references:

- security episode core;
- instruction profile core;
- runtime binding core;
- connector core;
- UI text bundle core;
- security catalog;
- episode type catalog;
- text channels catalog;
- layer and namespace catalog.

The responsibility of the core catalog is to provide a **single, machine-readable entry point** for:

- what exists in the red core;
- which ids are canonical;
- which verbs and envelopes are stable.

---

## 6. Role of MOVA-based tools and experts

A MOVA-based **expert** or tool that manages `global.*` and verbs can use this document to:

- validate proposed changes to global catalogs;
- decide whether a new verb is justified, or an existing one should be reused;
- detect duplication of roles, statuses, and categories across schemas;
- ensure that:
  - red core catalogs stay vendor-neutral;
  - domain-specific values are placed in skills or infra catalogs;
  - text channels and security dictionaries are used consistently.

In particular, such tools can check that:

- new schemas do not introduce local values that duplicate `global.*` entries;
- verbs used in envelopes come from the canonical catalogue;
- `episode_type` values conform to `global.episode_type_catalog_v1.json`;
- text channels (`human_ui`, `model_instruction`, `system_log`) are used correctly in `ds.ui_text_bundle_core_v1`;
- instruction profiles and security events reference valid security event and action types.

By doing so, MOVA-based tools help keep:

- the global layer coherent;
- the verbs catalogue small and clear;
- the overall language stable and evolvable over time.
