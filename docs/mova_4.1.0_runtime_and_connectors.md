# MOVA 4.1.0 — Runtime and Connector Core

> Audience: platform and infra engineers, skill authors, and tool builders who need to describe how MOVA artefacts are bound to execution environments and external systems.

This document describes the **runtime and connector core** of MOVA 4.1.0.

It explains how:

- execution environments are described in a **neutral, vendor-agnostic way**;
- connectors to external systems are modelled as **structured contracts**;
- these descriptions relate to skills, infra and applications in the layered model.

It is aligned with the following schemas and catalogs:

- `ds.runtime_binding_core_v1.schema.json`
- `ds.connector_core_v1.schema.json`
- `ds.mova_schema_core_v1.schema.json`
- `ds.mova_episode_core_v1.schema.json`
- `ds.mova4_core_catalog_v1.schema.json`
- `global.layers_and_namespaces_v1.json`
- `mova4_core_catalog.example.json`

---

## 1. Purpose

MOVA 4.1.0 is a language of **contracts**, not an execution engine.  
However, MOVA-based systems must still describe:

- **where** skills and scenarios are executed;
- **how** they are bound to runtimes;
- **which external systems** they can talk to;
- **under which constraints** (auth, rate limits, error contracts).

The runtime and connector core provides:

- a **vendor-neutral schema** for describing runtimes:
  - `ds.runtime_binding_core_v1`;
- a **vendor-neutral schema** for describing connectors:
  - `ds.connector_core_v1`.

These schemas do not contain executable code.  
They describe capabilities and bindings in a way that is:

- stable,
- machine-readable,
- and compatible with the MOVA layered model.

---

## 2. Runtime binding core

### 2.1. Role of runtime bindings

Runtime bindings describe the relationship between:

- MOVA-level artefacts (skills, scenarios, endpoints);
- and the **execution environments** in which they run.

They answer questions such as:

- “Which runtime executes this scenario or skill?”
- “What kind of environment is it?”
- “In which environment profile (dev, staging, prod) does it run?”
- “What capabilities does it have?”

Runtime bindings **do not**:

- define deployment pipelines;
- specify infrastructure as code;
- contain imperative logic.

They serve as a **contract** that can be:

- validated,
- inspected by tools,
- and used by planners and orchestrators.

### 2.2. Core schema

Runtime bindings are described by:

- `ds.runtime_binding_core_v1.schema.json`

Each runtime binding instance is a JSON document with at least:

- `runtime_id`  
  Stable identifier of the runtime instance or profile, for example:
  - `runtime.cloudflare_worker.smartlink_main_v1`
  - `runtime.local_process.file_cleanup_01`

- `runtime_kind`  
  Category of runtime, such as:
  - `serverless`
  - `edge`
  - `browser`
  - `local_process`
  - `container`
  - `other`

- `language` (optional)  
  Implementation language or platform, such as:
  - `javascript`
  - `typescript`
  - `python`
  - `go`
  - `wasm`
  - or platform identifiers.

- `runtime_version` (optional)  
  Version of the runtime platform, for example:
  - `nodejs_22`
  - `cf_workers_2025.1`
  - `browser_es2023`.

- `env_profile_id`  
  Environment profile id, such as:
  - `dev`
  - `staging`
  - `prod`
  - `test`
  - or organisation-specific profiles.

- `binding_targets`  
  A list or structure describing **what is bound** to this runtime, for example:
  - scenario or skill identifiers;
  - envelope types or routes;
  - service endpoints.

- `capabilities` (optional)  
  A structured description of runtime capabilities, such as:
  - network access (internal only, internet allowed, restricted domains);
  - storage capabilities;
  - access to queues or schedulers;
  - access to secret storage.

Additional fields may include:

- `meta` and `ext` for metadata;
- organisational tags;
- documentation links.

All fields are descriptive.  
They must not embed executable code or direct prompts.

### 2.3. Layer placement

`ds.runtime_binding_core_v1` is a **red core schema**:

- it lives in the red core layer;
- it is vendor-neutral;
- it defines the abstract shape of runtime bindings.

Concrete runtime description schemas in the **infra layer** may:

- extend `ds.runtime_binding_core_v1` via `allOf`;
- add vendor-specific fields, such as:
  - Cloudflare-specific settings;
  - container image references;
  - local process configuration;
  - resource limits.

Example infra-level identifiers:

- `ds.runtime_cloudflare_worker_v1`
- `ds.runtime_kubernetes_deployment_v1`
- `ds.runtime_local_node_process_v1`

These schemas remain outside the red core, but their shape is anchored in `ds.runtime_binding_core_v1`.

---

## 3. Connector core

### 3.1. Role of connectors

Connectors describe integration with **external systems**, such as:

- API providers;
- storage services;
- messaging platforms;
- AI services;
- internal microservices.

Connectors are not code that performs API calls.  
They are **contracts** describing:

- provider and resource identity;
- protocols;
- authentication methods;
- pagination and rate limit behaviours;
- error contract expectations.

They allow MOVA-based tools and planners to:

- understand available external capabilities;
- reason about dependencies;
- align skills and episodes with underlying integrations.

### 3.2. Core schema

Connectors are described by:

- `ds.connector_core_v1.schema.json`

Each connector instance is a JSON document with at least:

- `connector_id`  
  Stable identifier of the connector, for example:
  - `connector.openai.chat_v1`
  - `connector.google.sheets_v1`
  - `connector.internal.billing_api_v1`

- `provider`  
  Provider or organisation name, for example:
  - `openai`
  - `google`
  - `internal`
  - `stripe`
  - `other_vendor`.

- `resource`  
  Resource or service name within the provider, for example:
  - `chat`
  - `embeddings`
  - `calendar`
  - `sheets`
  - `payments`
  - `files`.

- `protocol`  
  Underlying protocol, such as:
  - `http`
  - `https`
  - `grpc`
  - `websocket`
  - `custom`.

- `auth_methods`  
  A structured list of supported authentication methods, for example:
  - `none`
  - `api_key`
  - `oauth2`
  - `jwt`
  - `basic`.

  Each method may include:
  - fields describing token or credential location;
  - reference to secret management configuration.

- `rate_limits` (optional)  
  Descriptive information about rate limiting, for example:
  - maximum requests per minute;
  - backoff recommendations.

- `pagination` (optional)  
  Hints about pagination behaviour, for example:
  - offset-based, cursor-based;
  - parameter names and expected behaviours.

- `error_contract` (optional)  
  Description of how errors are reported:
  - HTTP status codes and error fields;
  - structured error formats.

As with runtime bindings:

- `meta` and `ext` fields may carry non-instructional metadata;
- no executable code or prompts must be embedded.

### 3.3. Layer placement

`ds.connector_core_v1` is a **red core schema**:

- it provides the abstract shape of connectors;
- it is independent of vendors and products.

Concrete connector description schemas in the **infra layer** may:

- extend `ds.connector_core_v1` via `allOf`;
- add provider-specific fields (endpoints, regions, specific behaviours).

Examples:

- `ds.connector_openai_chat_v1` — describes the OpenAI Chat API;
- `ds.connector_google_sheets_v1` — describes Google Sheets API;
- `ds.connector_internal_billing_api_v1` — describes an internal billing API.

These schemas are infra-level and must respect:

- the shape of the core;
- the “no executable code” rule.

---

## 4. Integration with the layered model

### 4.1. Relationship to skills

Skills describe **what the system can do** at the domain level.  
They may:

- require certain runtime capabilities;
- assume access to certain connectors.

However, skills should not:

- hard-code specific vendor details;
- embed raw API calls in MOVA artefacts.

Instead:

- requirements can be expressed via:
  - references to runtime kinds or profiles (`runtime_kind`, `env_profile_id`);
  - references to connector ids (`connector_id`).

Example:

- A file cleanup skill may require:
  - a runtime of kind `local_process` or `serverless` with access to the file system;
  - a connector to a specific storage API if needed.

Mapping from skills to concrete runtimes and connectors:

- is handled in the **infra layer**;
- is visible and inspectable via runtime and connector instances.

### 4.2. Relationship to infra

The infra layer is where:

- concrete runtime instances exist;
- concrete connector instances are configured.

Infra-level documents:

- instantiate `ds.runtime_binding_core_v1` and `ds.connector_core_v1` derived schemas;
- link skills, routes and services to runtimes and connectors.

This allows:

- planning and deployment tools to read infra descriptions;
- MOVA-based experts to understand the topology of a system without knowing code details.

### 4.3. Relationship to applications and UX

Applications and user interfaces:

- do not operate directly on runtime and connector schemas;
- but they depend on capabilities that these schemas describe.

For example:

- an admin UI may show which runtimes are configured and which skills are bound to them;
- a diagnostics view may list connectors and their status.

These features are built on top of:

- `ds.runtime_binding_core_v1` and its extensions;
- `ds.connector_core_v1` and its extensions.

---

## 5. Episodes and audit trail

Runtime and connector descriptions interact with **episodes** to provide an audit trail.

### 5.1. Episodes referencing runtime and connector ids

Episodes (`ds.mova_episode_core_v1` and derived schemas) may include fields that reference:

- `runtime_id` for the executor environment;
- `connector_id` for external calls involved in the episode.

This enables:

- analysis of behaviour per runtime:
  - error rates;
  - performance;
  - load patterns;
- analysis of behaviour per connector:
  - usage patterns;
  - error patterns;
  - rate limits and throttling impact.

### 5.2. Security events and infra

Security event episodes (`ds.security_event_episode_core_v1`) may:

- refer to `runtime_id` and `connector_id` to show:
  - where a policy violation occurred;
  - which connector or runtime was involved;
- use `security_event_type` and `security_action_type` from `global.security_catalog_v1.json`.

This integration makes it possible to:

- trace security issues back to specific runtimes and connectors;
- adjust runtime or connector configuration as part of security responses.

---

## 6. Core catalog integration

The MOVA 4.1.0 core catalog:

- `ds.mova4_core_catalog_v1.schema.json`
- `mova4_core_catalog.example.json`

includes entries for:

- `data_types`:
  - `ds.runtime_binding_core_v1`
  - `ds.connector_core_v1`
  - and other red core schemas;
- `verbs`, `envelopes`, `episode_types` defined in the red core.

The catalog is published using:

- `env.mova4_core_catalog_publish_v1` with verb `publish`.

This allows:

- a single, machine-readable entry point for all core runtime and connector contracts;
- downstream tools to discover that runtime and connector cores exist and how to validate them.

---

## 7. Versioning and evolution

### 7.1. Schema versions

Runtime and connector core schemas follow the usual MOVA versioning rules:

- backward-compatible changes may be implemented within the same id (`*_v1`) with minor version bumps in `schema_version` (if used);
- breaking changes require new ids:
  - `ds.runtime_binding_core_v2`
  - `ds.connector_core_v2`, etc.

Infra-level schemas extending them must:

- declare which core version they depend on;
- be updated or replaced when core versions change.

### 7.2. Runtime and connector instances

Individual runtime and connector instances:

- may carry their own version tags or revision fields;
- may be updated independently of schemas.

However:

- tools must always validate instances against the correct schema version;
- references in episodes and configuration should remain stable or be migrated explicitly.

---

## 8. Responsibilities of platform and tool builders

Platform and tool builders working with MOVA 4.1.0 should:

1. **Implement schema validation**

   - validate runtime binding instances against `ds.runtime_binding_core_v1` or derived schemas;
   - validate connector instances against `ds.connector_core_v1` or derived schemas.

2. **Keep red core neutral**

   - avoid embedding vendor details in red core schemas;
   - place provider-specific details in infra-level extensions.

3. **Expose capabilities structurally**

   - expose runtime and connector metadata via JSON documents, not free-form text;
   - ensure that skills and applications can discover capabilities programmatically.

4. **Integrate with episodes**

   - ensure that executors record:
     - which runtime was used (`runtime_id`);
     - which connectors were involved (`connector_id`);
   - use this information for:
     - audits,
     - performance analysis,
     - security investigations.

5. **Support evolution**

   - plan for runtime and connector changes without breaking MOVA contracts;
   - use versioning and explicit migration steps.

---

## 9. Checklist for authors of runtime and connector descriptions

When designing runtime or connector descriptions for a MOVA-based system:

1. **Choose the right layer**

   - red core: only `ds.runtime_binding_core_v1` and `ds.connector_core_v1` themselves;
   - infra: concrete runtime and connector schemas that extend the core.

2. **Use descriptive ids**

   - follow patterns such as:
     - `runtime.<platform>.<purpose>_v1`
     - `connector.<provider>.<resource>_v1`.

3. **Describe capabilities, not code**

   - focus on:
     - runtime kind,
     - environment profile,
     - provider and resource,
     - auth methods,
     - rate limits;
   - avoid embedding executable logic.

4. **Link to skills and episodes**

   - make it possible to:
     - connect skills to runtimes and connectors;
     - reference runtime and connector ids from episodes.

By following this runtime and connector core specification, MOVA-based systems can:

- remain transparent about where and how they execute;
- integrate with external systems in a structured, analysable way;
- evolve infra independently, while preserving a stable contractual core.
