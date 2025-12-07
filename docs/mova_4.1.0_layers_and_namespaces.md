# MOVA 4.1.0 — Layered Model and Namespaces

> Canonical language of this document: **English for text and identifiers** (`ds.*`, `env.*`, `global.*`, `skill.*`, etc.).  
> This document describes how the MOVA language is embedded into larger systems through a layered architecture and a consistent namespace policy.

## 1. Purpose

The MOVA 4.1.0 core specification defines the language itself:

- data schemas (`ds.*`);
- envelopes (`env.*`);
- verbs;
- global catalogs (`global.*`);
- episode frames.

This document explains how that language is used in a **layered model**:

- as a **constitutional core** (red core layer);
- on top of which **skills and domain scenarios** are built (skills layer);
- and on top of which **runtime bindings and connectors** are defined (infra layer);
- finally consumed by **applications and user experiences** (applications / UX layer).

The goals are to:

- separate responsibilities between layers;
- keep the **red core stable and vendor-neutral**;
- give skills and products room to evolve independently;
- and show where MOVA is applied as a contract for data and actions.

The canonical JSON representation of this model is provided by:

- `global.layers_and_namespaces_v1.json`.

---

## 2. Overview of layers

MOVA 4.1.0 works with three main technical layers and one product layer on top.

### 2.1. Red core layer

The **red core** is the constitutional layer of MOVA. It contains only:

- **data schemas** that define the language itself:
  - `ds.mova_schema_core_v1`,
  - `ds.mova_episode_core_v1`,
  - `ds.security_event_episode_core_v1`,
  - `ds.instruction_profile_core_v1`,
  - `ds.runtime_binding_core_v1`,
  - `ds.connector_core_v1`,
  - `ds.ui_text_bundle_core_v1`,
  - `ds.mova4_core_catalog_v1`,
  - other strictly core `ds.*`;
- **envelopes** that operate on these schemas:
  - `env.mova4_core_catalog_publish_v1`,
  - `env.instruction_profile_publish_v1`,
  - `env.security_event_store_v1`,
  - other core `env.*`;
- **global catalogs**:
  - `global.security_catalog_v1.json`,
  - `global.episode_type_catalog_v1.json`,
  - `global.layers_and_namespaces_v1.json`,
  - `global.text_channel_catalog_v1.json`,
  - other core `global.*`;
- **core verbs** such as `create`, `update`, `route`, `record`, `publish`.

Characteristics of the red core:

- **vendor-neutral** — no provider or platform specific details;
- **stable** — changes are rare and carefully versioned;
- **minimal** — only constitutional constructs live here.

The red core answers the question:

> “What does it mean, in general, to speak MOVA?”

### 2.2. Skills layer

The **skills layer** contains domain-specific logic expressed in MOVA terms. It includes:

- domain-level `ds.*` schemas, for example:
  - `ds.file_cleanup_target_v1`,
  - `ds.file_cleanup_plan_v1`,
  - `ds.smartlink_config_v1`,
  - `ds.smartlink_route_decision_v1`,
  - social and e-commerce schemas;
- domain-level `env.*` envelopes that combine core verbs with domain data;
- skill descriptors and metadata (`skill.*` if such schemas are defined).

Typical responsibilities of this layer:

- define **scenarios and skills** for concrete domains (file cleanup, routing, social forms, etc.);
- decide **where episodes are recorded** and how they reference domain data;
- map domain actions to MOVA verbs and envelopes.

The skills layer answers the question:

> “What can this MOVA-based system actually do in this domain?”

### 2.3. Infra layer (runtimes and connectors)

The **infra layer** connects MOVA artefacts to real execution environments and external systems. It includes:

- **runtime binding descriptions**, for example:
  - `ds.runtime_binding_core_v1` instances that describe how scenarios and skills are bound to:
    - serverless workers,
    - edge runtimes,
    - browser applications,
    - local processes;
- **connector descriptions**, for example:
  - `ds.connector_core_v1` instances for:
    - external APIs,
    - storage services,
    - messaging platforms.

Infra schemas and configurations:

- must respect the red core contracts;
- may include vendor-specific details (API endpoints, auth methods, rate limits);
- must not redefine the meaning of core verbs, envelopes or episode fields.

The infra layer answers the question:

> “Where and how are these MOVA skills actually executed, and which external systems do they talk to?”

### 2.4. Applications and UX

Above these technical layers sit **applications and user experiences**:

- end-user applications (web, mobile, desktop);
- admin consoles and dashboards;
- developer tools and editors.

Applications:

- call into the skills and infra layers via MOVA envelopes and APIs built on top of them;
- present human-facing text that respects the `human_ui` / `model_instruction` separation;
- consume episodes and analytics to improve the user experience.

The applications layer answers the question:

> “How does a human use this MOVA-based system in practice?”

---

## 3. Namespaces and identifiers

Identifiers (IDs) in MOVA — schema ids, envelope ids, catalog ids — follow a namespace policy that reflects the layered model.

### 3.1. General identifier rules

For `ds.*`, `env.*`, `global.*` and other identifiers, MOVA 4.1.0 adopts the following general rules:

- Identifiers must be **stable**:
  - once published, an id must not silently change meaning;
  - breaking changes require a new id (for example `_v2`, `_v3`).
- Identifiers must be **descriptive**:
  - convey layer and domain where possible;
  - avoid opaque ids that reveal nothing about their purpose.
- Identifiers must be **globally unique** within a MOVA universe:
  - collisions between packages should be avoided by following namespace prefixes.

The JSON schema `$id` fields for red core schemas follow the same ids, for example:

- `https://mova.dev/schemas/ds.mova_episode_core_v1.schema.json`.

### 3.2. Red core namespaces

Red core identifiers are reserved and must not be reused in skills or infra for unrelated purposes.

Examples include:

- `ds.mova_schema_core_v1`
- `ds.mova_episode_core_v1`
- `ds.security_event_episode_core_v1`
- `ds.instruction_profile_core_v1`
- `ds.runtime_binding_core_v1`
- `ds.connector_core_v1`
- `ds.ui_text_bundle_core_v1`
- `ds.mova4_core_catalog_v1`
- `env.mova4_core_catalog_publish_v1`
- `env.instruction_profile_publish_v1`
- `env.security_event_store_v1`
- `global.security_catalog_v1`
- `global.episode_type_catalog_v1`
- `global.layers_and_namespaces_v1`
- `global.text_channel_catalog_v1`

Characteristics of red core ids:

- use the `mova` or clearly core prefixes (such as `security`, `runtime_binding_core`, `connector_core`);
- are documented in the core catalog (`ds.mova4_core_catalog_v1`);
- are versioned cautiously (new ids for breaking changes).

No domain or vendor code is allowed to introduce new identifiers under `ds.mova_*` or other reserved core prefixes.

### 3.3. Skills namespaces

Skills and domain packages define their own namespaces on top of the core.

Examples:

- `ds.file_cleanup_target_v1`
- `ds.file_cleanup_snapshot_v1`
- `ds.file_cleanup_plan_v1`
- `ds.smartlink_config_v1`
- `ds.smartlink_route_decision_v1`
- `env.file_cleanup_plan_generate_v1`
- `env.smartlink_route_decision_v1`

Typical patterns:

- **domain prefix first**, then descriptive name, then version:
  - `file_cleanup_*`,
  - `smartlink_*`,
  - `social_*`,
  - `ecommerce_*`, etc.
- Envelopes for skills may reuse verbs and patterns from the red core:
  - for example, a `route` envelope in a Smartlink skill.

Skills must not:

- define new schemas under prefixes reserved for the red core;
- redefine the meaning of red core schemas or global catalogs.

They may:

- extend red core schemas via `allOf`;
- add domain-specific properties and additional dictionaries under their own prefixes.

### 3.4. Infra namespaces

Infra namespaces describe runtime bindings and connectors.

Examples:

- `ds.connector_openai_chat_v1`
- `ds.connector_google_sheets_v1`
- `ds.connector_internal_billing_api_v1`
- `ds.runtime_cloudflare_worker_v1`
- `ds.runtime_local_process_v1`

These schemas:

- extend `ds.connector_core_v1` or `ds.runtime_binding_core_v1`;
- add vendor-specific fields (endpoints, auth, quotas, environment configuration).

Naming pattern:

- `ds.connector_<provider>_<resource>_v1`
- `ds.runtime_<platform>_<profile>_v1`

Infra schemas live outside the red core, even though they depend on red core contracts.

They must not:

- change the meaning of core verbs (`create`, `update`, `route`, `record`, `publish`);
- redefine fields of core schemas in incompatible ways.

---

## 4. Layer boundaries and contracts

### 4.1. Boundary between red core and skills

The boundary between red core and skills is defined by:

- which schemas and catalogs are considered constitutional;
- how domain schemas extend them.

Rules:

- Skills may **extend** red core schemas via `allOf`, but not **modify** them.
- Skills may **use** red core global catalogs (for example episode types, security types, text channels).
- Skills may propose **new global catalogs** for domain use, but these must be clearly namespaced as domain globals, not core globals.
- Red core schemas must not depend on specific skills or products.

All communication between red core and skills flows through:

- shared validators (JSON Schema + global catalogs);
- explicit references in catalog entries;
- episode records that use agreed-upon fields and types.

### 4.2. Boundary between skills and infra

The boundary between skills and infra is where:

- domain scenarios expect certain execution capabilities;
- infra declares what runtimes and connectors exist.

Rules:

- Skills may express **requirements** and **assumptions** in their own schemas and catalogs (for example, types of connectors they expect);
- Infra must provide **descriptions of available runtimes and connectors** using core schemas:
  - `ds.runtime_binding_core_v1`,
  - `ds.connector_core_v1`,
  - and extensions thereof.
- Skills must not depend directly on vendor-specific details unless those are modelled as infra-level schemas.

This makes it possible to:

- run the same skills with different infra backends;
- evolve infra (change runtimes, add connectors) without changing the skills, as long as contracts are preserved.

### 4.3. Boundary between infra and external systems

The boundary between infra and external systems is outside the MOVA universe.

Here:

- MOVA schemas describe the **expected contract** with external systems;
- infra implementations handle the details of API calls, authentication, retries, etc.

MOVA does not define:

- HTTP request shapes;
- authentication flows;
- low-level protocol details.

It only ensures that:

- connectors are declared and described in a structured way;
- episodes can record what was requested and what happened.

---

## 5. Examples of layer usage

### 5.1. File cleanup scenario

- **Red core**:
  - `ds.mova_episode_core_v1` for episodes;
  - `global.episode_type_catalog_v1` for types such as `plan/file_cleanup`, `execution/file_cleanup`.

- **Skills**:
  - `ds.file_cleanup_target_v1` — describes what needs cleaning;
  - `ds.file_cleanup_plan_v1` — describes the plan;
  - envelopes `env.file_cleanup_plan_generate_v1`, `env.file_cleanup_execute_v1`.

- **Infra**:
  - runtime binding for a worker that can scan and plan cleanup;
  - connector descriptions for file systems or storage APIs.

- **Applications**:
  - UI for selecting targets and reviewing plans;
  - visualisation of episodes and cleanup results.

### 5.2. Smartlink routing

- **Red core**:
  - core verbs including `route`;
  - `ds.ui_text_bundle_core_v1` for UI text, if used;
  - `ds.mova_episode_core_v1` for routing episodes.

- **Skills**:
  - `ds.smartlink_config_v1` — defines routing rules and targets;
  - `ds.smartlink_route_decision_v1` — describes a single routing decision;
  - `env.smartlink_route_decision_v1` — uses verb `route`.

- **Infra**:
  - edge or serverless runtime bindings for routing endpoints;
  - connectors to analytics or reporting services.

- **Applications**:
  - dashboards to configure smartlinks;
  - visualisation of performance and episodes.

These examples show how the same core contracts (ds/env/global/episodes) support different domains without changing the red core.

---

## 6. Evolution and versioning across layers

### 6.1. Red core

- Evolves slowly and in a controlled way.
- Breaking changes require:
  - new schema ids (for example `*_v2`);
  - new catalog versions;
  - migration plans for existing skills and infra.

### 6.2. Skills

- Can evolve more quickly than the core.
- Should:
  - maintain compatibility with the versions of the red core they depend on;
  - record episodes that make migrations traceable.

### 6.3. Infra

- Evolves independently of both red core and skills.
- Can:
  - add new runtimes and connectors;
  - deprecate outdated connectors;
  - change deployment details.

As long as infra continues to satisfy the contracts expressed in the red core and used by skills, the system remains coherent.

---

## 7. Checklist for schema authors

When adding new schemas or catalogs to a MOVA 4.1.0 universe:

1. **Identify the layer**

   - Is this a constitutional concept (red core)?
   - A domain skill or scenario (skills)?
   - A runtime or connector description (infra)?

2. **Choose the namespace**

   - Red core: use reserved prefixes and patterns;
   - Skills: choose a clear domain prefix;
   - Infra: follow `connector_*` / `runtime_*` patterns.

3. **Respect global catalogs**

   - Use existing `global.*` dictionaries where appropriate;
   - Avoid redefining global values locally.

4. **Align with verbs**

   - Use core verbs where possible;
   - Propose new verbs only when necessary, with clear semantics.

5. **Plan for episodes**

   - Decide how work related to this schema will be recorded as episodes;
   - Use `episode_type` patterns from `global.episode_type_catalog_v1.json`.

By following this layered model and namespace policy, MOVA-based systems remain:

- understandable;
- evolvable;
- and safe to extend over time without breaking the constitutional core.
