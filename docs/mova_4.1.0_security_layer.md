# MOVA 4.1.0 — Security Layer

> Audience: authors of instruction profiles, platform owners, security engineers, and tool builders who must enforce safety and policy constraints in MOVA-based systems.

This document describes the **security layer** of MOVA 4.1.0.  
It explains how:

- **instruction profiles** describe policies and guardrails;
- **security events** are recorded as structured episodes;
- **global security catalogs** provide shared vocabularies;
- **security model versioning** works across profiles and events.

It is aligned with the following schemas and catalogs:

- `ds.security_event_episode_core_v1.schema.json`
- `ds.instruction_profile_core_v1.schema.json`
- `env.security_event_store_v1.schema.json`
- `env.instruction_profile_publish_v1.schema.json`
- `global.security_catalog_v1.json`
- `ds.mova_episode_core_v1.schema.json`
- `global.episode_type_catalog_v1.json`
- `ds.mova4_core_catalog_v1.schema.json`

---

## 1. Purpose and scope

The MOVA 4.1.0 security layer is part of the **red core**. Its goals are:

- to provide a **standard way to describe policies and guardrails** (instruction profiles);
- to provide a **standard way to record security events** as episodes;
- to offer a **shared vocabulary** for security event types and actions;
- to make security decisions **auditable, analysable and evolvable** over time.

The security layer:

- does not prescribe specific algorithms for detection or enforcement;
- does not implement access control or cryptography;
- does not depend on a specific vendor, runtime or product.

Instead, it defines **contracts** that any executor or platform can use:

- to attach policies to MOVA artefacts;
- to report security events in a structured way;
- to track and evolve a **security model** across versions.

---

## 2. Security model in MOVA

The security model in MOVA 4.1.0 is expressed through three main building blocks:

1. **Instruction profiles**

   - `ds.instruction_profile_core_v1.schema.json`
   - `env.instruction_profile_publish_v1.schema.json`

   Instruction profiles describe **what is allowed, denied, logged or transformed** in a MOVA-based system.

2. **Security events**

   - `ds.security_event_episode_core_v1.schema.json`
   - `env.security_event_store_v1.schema.json`

   Security events record **what actually happened** from a security perspective: violations, detections, blocks, fallbacks.

3. **Security catalogs**

   - `global.security_catalog_v1.json`

   Security catalogs define shared identifiers for:

   - `security_event_type`
   - `security_action_type`
   - high-level policy profiles.

These elements are linked by a common field:

- `security_model_version` — indicating which version of the security model a profile or event is written for.

---

## 3. Instruction profiles

Instruction profiles describe **how executors and guards must behave** with respect to instructions, inputs, outputs and tools.

### 3.1. Core schema

Instruction profiles are defined by:

- `ds.instruction_profile_core_v1.schema.json`

Each profile instance is a JSON document that includes at least:

- `profile_id`  
  Stable identifier of the profile (for example `mova_security_default_v1`).

- `profile_version`  
  Version of this profile (for example `"1.0.0"`).

- `security_model_version`  
  Version of the security model the profile conforms to (for example `"1.0"`).

- `status`  
  Profile status (`draft`, `active`, `deprecated`).

- `applies_to`  
  A collection of selectors indicating **where** the profile applies:
  - executors (by id, type or environment);
  - roles;
  - envelopes (`env.*`);
  - data types (`ds.*`).

- `rules`  
  A list of rules. Each rule typically contains:
  - `rule_id` — unique id of the rule within the profile;
  - `description` — human-readable description of the rule (policy statement, not a prompt);
  - `effect` — what should happen if the rule is triggered:
    - `allow`
    - `deny`
    - `warn`
    - `log_only`
    - `transform`
  - `target` — what the rule inspects:
    - target kind (input, output, envelope, executor, tool, etc.);
    - selectors (paths, ids, patterns).
  - `severity` — severity level (`info`, `warning`, `error`, `critical`);
  - `on_violation` — recommended security actions (see `global.security_catalog_v1.json`).

Profiles may also contain:

- references to documentation;
- audit information (who created or approved the profile);
- extension fields for vendor- or organisation-specific metadata.

### 3.2. Publishing profiles

Instruction profiles are distributed using the envelope:

- `env.instruction_profile_publish_v1.schema.json` (+ example)

This envelope has:

- `envelope_id = "env.instruction_profile_publish_v1"`;
- `verb = "publish"`;
- roles, for example:
  - `publisher` — component or authority that publishes the profile;
  - `executor` or `guard` — target system that should enforce the profile;
- a payload field (for example `profile`) carrying a `ds.instruction_profile_core_v1` document.

Publishing a profile is a **declarative act**:

- it does not force immediate enforcement;
- it informs executors and guards about available and updated profiles.

Executors and guards should:

- receive and validate profiles;
- decide, based on local configuration, which profiles to apply;
- record security events when violations or suspicious conditions are detected.

### 3.3. Relationship to instructions for AI models

Instruction profiles are part of the **red core** and are written in a neutral, declarative manner.

They should not:

- contain raw prompts or model-specific instruction text.

Instead, they may:

- refer to text channels and fields that contain `model_instruction` text (see `global.text_channel_catalog_v1.json` and `ds.ui_text_bundle_core_v1`).
- express constraints such as:
  - “Do not execute tools of type X in this environment”;
  - “Do not accept user input containing personal data without confirmation”;
  - “Do not forward raw user text to external APIs”.

Executors and guards are responsible for interpreting these rules and applying them to concrete models and tools.

---

## 4. Security events and episodes

Security events represent **observations of security-relevant situations** in a MOVA-based system.

### 4.1. Core security event episode

Security events are recorded as episodes using:

- `ds.security_event_episode_core_v1.schema.json`

This schema extends `ds.mova_episode_core_v1` and includes at least:

- `episode_type`  
  An episode type of the form:
  - `security_event`
  - or `security_event/<subtype>`, for example `security_event/prompt_injection_suspected`.

- `security_event_type`  
  An identifier of the event type (from `global.security_catalog_v1.json`), for example:
  - `prompt_injection_suspected`
  - `instruction_profile_invalid`
  - `forbidden_tool_requested`
  - `other`.

- `security_event_category`  
  A broader category, such as:
  - `input_validation`
  - `policy_violation`
  - `runtime_error`
  - `other`.

- `severity`  
  Severity level:
  - for example `info`, `warning`, `error`, `critical`.

- `policy_profile_id`  
  Id of the active profile that was applied or violated (if applicable).

- `policy_ref`  
  Reference to the specific rule or policy section involved.

- `security_model_version`  
  Version of the security model used to interpret the event.

- `detection_source`  
  Component or layer that detected the event:
  - `llm_guard`
  - `runtime_proxy`
  - `ui_layer`
  - `monitoring_service`
  - other.

- `detection_confidence` (optional)  
  Confidence value for the detection, for example a numeric score or a qualitative label.

- `recommended_actions`  
  Recommended actions from the perspective of the security model:
  - values from `security_action_type` in `global.security_catalog_v1.json`.

- `actions_taken`  
  Actions that were actually applied:
  - for example `log`, `alert`, `block`, `fallback`.

The base episode fields (`episode_id`, `recorded_at`, `executor`, `result_status`, `result_summary`) remain available and must be populated consistently.

### 4.2. Storing security events

Security events are stored using the envelope:

- `env.security_event_store_v1.schema.json` (+ example)

This envelope has:

- `envelope_id = "env.security_event_store_v1"`;
- `verb = "record"`;
- roles such as:
  - `producer` — component that detected or generated the event;
  - `security_store` — log or storage for security events;
- a payload field (for example `event`) containing a `ds.security_event_episode_core_v1` document.

The purpose of this envelope is to:

- transmit security event episodes to security storage;
- ensure that they are recorded in a consistent shape;
- provide clear roles for producers and stores.

Executors and guards should use this envelope whenever a security-relevant event is considered significant enough to be recorded.

### 4.3. Examples of security events

Typical events that should be recorded as security episodes include:

- detection of **prompt injection** attempts;
- requests to **forbidden tools** or resources;
- attempts to bypass policies (for example using hidden channels);
- mismatches between expected and actual instruction profiles;
- suspicious access to sensitive data;
- abnormal patterns in usage that trigger alerts.

The concrete set of event types and categories is defined in `global.security_catalog_v1.json` and may be extended over time.

---

## 5. Security catalogs

The security catalogs provide shared vocabulary for event types, actions and policy profiles.

### 5.1. Core catalog

The core security catalog is:

- `global.security_catalog_v1.json`

It typically contains:

1. **Security event types**

   A list of `security_event_type` values, for example:

   - `instruction_profile_invalid`
   - `prompt_injection_suspected`
   - `forbidden_tool_requested`
   - `sensitive_data_access_suspected`
   - `rate_limit_exceeded`
   - `other`

2. **Security action types**

   A list of `security_action_type` values, for example:

   - `log`
   - `alert`
   - `block`
   - `fallback`
   - `escalate`
   - `ignore` (for explicit acknowledgement of no action)

3. **Security policy profiles**

   High-level profiles pre-defined by the MOVA universe, for example:

   - `mova_security_default_v1`
   - `mova_security_dev_v1`

   Each profile entry contains:

   - a profile id;
   - `security_model_version`;
   - a human-readable description of its purpose and strictness.

### 5.2. Versioning

The security catalog itself is versioned as a MOVA artefact.  
Within it:

- `security_event_type` and `security_action_type` should not silently change meaning;
- new values may be added;
- obsolete values may be marked as deprecated with clear documentation.

Complex or organisation-specific security catalogs may be defined in additional `global.*` files, but:

- the **red core** catalog remains vendor-neutral and small;
- product- or organisation-specific extensions must be clearly labelled and not override core meanings.

---

## 6. Security model versioning

The `security_model_version` field appears in several places:

- in instruction profiles (`ds.instruction_profile_core_v1`);
- in security event episodes (`ds.security_event_episode_core_v1`);
- in security policy profiles (`global.security_catalog_v1.json`).

It serves to:

- differentiate incompatible security models;
- allow old episodes and profiles to be interpreted in their original context;
- support gradual migrations between security models.

### 6.1. Introducing a new security model version

When introducing a new major security model version:

- assign a new `security_model_version` value (for example `"2.0"`);
- create new or updated instruction profiles that reference this version;
- adjust detection and enforcement mechanisms accordingly;
- ensure that episodes recorded under previous versions remain valid and clearly identifiable.

Executors should:

- know which `security_model_version` they support;
- reject or handle with caution profiles and events specifying unknown versions.

---

## 7. Integration with episodes and genetic layer

Security events are part of the broader **episode and genetic layer**.

- All security events are episodes with `episode_type` starting with `security_event`.
- They share core episode fields and can be analysed alongside `execution/*` and `plan/*` episodes.

This integration enables:

- joint analysis of behaviour and security:
  - how often security events occur in specific scenarios;
  - how security decisions impact outcomes;
- evolution of skills and UX based on security signals:
  - adjusting prompts and flows to reduce risk;
  - tightening or relaxing policies where appropriate.

Aggregators in the genetic layer may, for example:

- count occurrences of certain `security_event_type` values;
- correlate them with specific skills, scenarios, tools or user actions;
- propose changes to instruction profiles or scenarios.

---

## 8. Responsibilities of executors and guards

Executors and guards in a MOVA-based system have the following responsibilities with respect to the security layer:

1. **Profile handling**

   - Receive instruction profiles sent via `env.instruction_profile_publish_v1`;
   - Validate profiles against `ds.instruction_profile_core_v1`;
   - Decide which profiles to apply in which contexts;
   - Honour `security_model_version`.

2. **Enforcement**

   - Apply rules from active profiles to:
     - envelopes,
     - data,
     - tool calls,
     - user inputs and outputs;
   - take actions defined in rules (`allow`, `deny`, `warn`, `log_only`, `transform`).

3. **Event recording**

   - When security-relevant conditions occur:
     - create `ds.security_event_episode_core_v1` episodes;
     - set `episode_type`, `security_event_type`, `severity`, `policy_profile_id`, `security_model_version` appropriately;
     - record `recommended_actions` and `actions_taken`;
     - send events via `env.security_event_store_v1` to a security store.

4. **Transparency and auditability**

   - Ensure that security decisions are traceable via episodes;
   - avoid silent enforcement changes without corresponding profile or model updates.

---

## 9. Checklist for security layer integration

When integrating MOVA 4.1.0 security into a system:

1. **Implement schema validation**

   - Validate instruction profiles and security events against:
     - `ds.instruction_profile_core_v1`
     - `ds.security_event_episode_core_v1`.

2. **Support profile publication**

   - Handle `env.instruction_profile_publish_v1` envelopes;
   - Make profiles available to relevant executors and guards.

3. **Adopt security catalogs**

   - Use `global.security_catalog_v1.json` for:
     - `security_event_type`
     - `security_action_type`
     - core policy profiles.

4. **Record security events**

   - Use `env.security_event_store_v1` to store security event episodes;
   - ensure that episodes have consistent `episode_type` and `security_model_version`.

5. **Respect the layered model**

   - Keep the security layer vendor-neutral at the red core level;
   - place vendor-specific enforcement logic in the infra or product layers.

---

The MOVA 4.1.0 security layer is designed to be:

- **minimal** — only essential contracts are part of the red core;
- **extensible** — organisations can extend catalogs and profiles;
- **auditable** — all important events and policies are expressed as structured data and episodes;
- **evolvable** — the security model can grow and change while preserving history.
