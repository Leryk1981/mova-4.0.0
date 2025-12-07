# MOVA 4.1.0 — Episodes and Genetic Layer (Pattern Memory)

> Audience: authors of episode schemas, skill developers, and MOVA-based tools that analyse system behaviour.

This document explains how **episodes** are represented in MOVA 4.1.0 and how they form the basis of the **genetic layer** (pattern memory).

It is aligned with the MOVA 4.1.0 core specification and the following schemas and catalogs:

- `ds.mova_episode_core_v1.schema.json`
- `ds.security_event_episode_core_v1.schema.json`
- `global.episode_type_catalog_v1.json`
- `global.security_catalog_v1.json`
- `ds.instruction_profile_core_v1.schema.json`
- `env.security_event_store_v1.schema.json`
- `ds.mova4_core_catalog_v1.schema.json`

---

## 1. Purpose of episodes

An **episode** is a structured record of one meaningful step in system work.  
An episode answers:

- what was done,
- on which data,
- by which executor,
- with what result,
- in which context.

The goals of episodes are to:

- provide **audit and reproducibility**;
- form a basis for **analytics and optimisation**;
- build a **genetic layer** (pattern memory) that allows schemas, envelopes and execution strategies to evolve.

Episodes are not low-level traces or raw logs.  
They are **intentional records**: each episode represents a step that matters for understanding and improving the system.

---

## 2. Minimal episode shape in MOVA 4.1.0

The base shape of all episodes is defined by:

- `ds.mova_episode_core_v1.schema.json`

This core schema is embedded (via `allOf`) into all episode schemas in MOVA.

### 2.1. Core fields

Regardless of domain, every episode derived from `ds.mova_episode_core_v1` contains at least:

1. **Identifiers and time**

   - `episode_id` — unique identifier of the episode;
   - `episode_type` — category of the episode (see section 3 and `global.episode_type_catalog_v1.json`);
   - `recorded_at` — timestamp when the episode was recorded.

2. **MOVA and model versions**

   - `mova_version` — version of the MOVA model active when the episode was recorded;
   - optional `security_model_version` (for security-related episodes).

3. **Executor and environment**

   - `executor` — structured description of who or what executed the step:
     - role (human, service, AI agent, tool, etc.);
     - identifier (user id, service id, skill id);
     - environment information (runtime id, environment profile, version).

4. **Input context**

   - references to input envelopes (`env.*`) that the executor processed;
   - references to key data records (`ds.*`) that were relevant for the decision or action.

5. **Result**

   - `result_status` — status of the outcome (for example `completed`, `failed`, `partial`, `cancelled`);
   - `result_summary` — short human-readable description of the outcome;
   - references to new or changed data records (`ds.*`), if any.

6. **Additional technical context (optional)**

   - log references;
   - metrics;
   - trace identifiers;
   - correlation identifiers;
   - other technical metadata.

Episode schemas may extend this set of fields for specific domains, but **must not drop** the basic attributes provided by `ds.mova_episode_core_v1`.

---

## 3. Episode types

The field `episode_type` classifies episodes into a small number of core types with optional subtypes.

The core dictionary is defined by:

- `global.episode_type_catalog_v1.json`

### 3.1. Core episode types

The following core ids are stabilised in MOVA 4.1.0:

- `execution` — an episode that records **actual execution** of a step:
  - a plan applied,
  - a route chosen,
  - a document generated,
  - a cleanup applied,
  - etc.

- `plan` — an episode that records **planning activity**:
  - a plan proposed,
  - a plan refined,
  - a plan approved or rejected.

- `security_event` — an episode that records a **security-relevant event**:
  - instruction profile violation,
  - suspicious input detected,
  - blocked action,
  - forced fallback behaviour.

- `other` — an episode that does not fit the three categories above.

### 3.2. Format with subtypes

MOVA 4.1.0 recommends the following format:

- `episode_type = "<core_id>[/<subtype>]"`

Examples:

- `execution/file_cleanup`
- `execution/smartlink_route`
- `plan/task`
- `plan/file_cleanup`
- `security_event/prompt_injection_suspected`
- `security_event/policy_violation`
- `other/analysis`
- `other/custom_domain`

Subtypes are free-form strings defined by skills or products, but they must:

- start with a valid core id from `global.episode_type_catalog_v1.json`;
- be stable enough to support analysis and aggregation over time.

Episode schemas in the **skills** layer must use this pattern and not introduce completely independent classification schemes.

---

## 4. Security event episodes

Security event episodes are a specialisation of the base episode frame.  
They are defined by:

- `ds.security_event_episode_core_v1.schema.json`

This schema extends `ds.mova_episode_core_v1` with security-specific fields, including:

- `security_event_type` — identifier of the security event (see `global.security_catalog_v1.json`);
- `security_event_category` — high-level category (for example `input_validation`, `policy_violation`, `runtime_error`, `other`);
- `severity` — severity level (for example `info`, `warning`, `error`, `critical`);
- `policy_profile_id` — id of the instruction or security profile involved;
- `policy_ref` — reference to a concrete policy rule or section;
- `security_model_version` — version of the security model used to interpret this event;
- `detection_source` — component that detected the event (for example `llm_guard`, `runtime_proxy`, `ui_layer`);
- `detection_confidence` — optional confidence value;
- `recommended_actions` — recommended follow-up actions (for example `log`, `alert`, `block`, `fallback`);
- `actions_taken` — actions that were actually taken.

Security event episodes are stored using the envelope:

- `env.security_event_store_v1` with verb `record`.

This envelope typically includes:

- `roles.producer` — component that produces the security event;
- `roles.security_store` — target store or log;
- payload `event` — a `ds.security_event_episode_core_v1` document.

This mechanism provides a **structured, auditable trail** of security events that can be analysed and aggregated as part of the genetic layer.

---

## 5. When to create an episode

Episodes should be recorded for **meaningful milestones**, not for every low-level operation.

Typical moments when an episode should be created:

- when an **important decision** has been made:
  - a plan is selected,
  - a routing decision is taken,
  - changes are approved by a user or a policy;
- when **substantial data changes** occur:
  - a profile is updated,
  - a document is generated,
  - a plan is stored or activated;
- when a **coherent scenario step** completes:
  - a form section is completed,
  - a review step is finished,
  - a critical external call and its handling are done.

Not every technical detail needs a dedicated episode.  
Executors should focus on recording **steps that matter for audit, analysis and evolution** — points where the scenario could have diverged or where a decision impacts future behaviour.

---

## 6. Episode structures in MOVA

In MOVA 4.1.0, episodes are defined by schemas that extend:

- `ds.mova_episode_core_v1` for general episodes;
- `ds.security_event_episode_core_v1` for security events.

Typical fields in a concrete episode schema:

- `episode_id` — unique identifier;
- `episode_type` — type with core id and subtype, for example:
  - `execution/file_cleanup`,
  - `execution/smartlink_route`,
  - `plan/task`,
  - `security_event/prompt_injection_suspected`;
- `mova_version` — MOVA model version;
- `input_envelopes` — references to input envelopes;
- `input_data_refs` — references to key `ds.*` records;
- `executor` — executor description (role, id, environment);
- `result_status` — outcome status;
- `result_summary` — short explanation;
- `output_data_refs` — references to new or changed data records;
- `meta` — technical metadata, correlation ids, etc.

Domain-specific episode schemas may add:

- user feedback fields (ratings, comments);
- quality metrics;
- structured explanations;
- fields for aggregation and reporting.

However, they should always:

- keep the core fields from `ds.mova_episode_core_v1`;
- use `episode_type` values consistent with `global.episode_type_catalog_v1.json`.

---

## 7. Genetic layer (pattern memory)

The **genetic layer** (pattern memory) is the layer where episodes are:

- accumulated;
- analysed by aggregators;
- used to guide evolution of MOVA artefacts.

The genetic layer:

- stores many episodes of real system work;
- applies analysis and aggregation to these episodes;
- produces insights that can be used to:
  - improve schemas (`ds.*`);
  - refine envelopes (`env.*`);
  - adjust skills and execution strategies;
  - tune instruction profiles and security policies.

The genetic layer **is not a machine-learning model**.  
It is a layer of **data about system experience**.

Examples of how episodes feed the genetic layer:

- In Smartlink-style routing:
  - analysis of many `execution/smartlink_route` episodes shows which routing strategies lead to better conversion;
  - security events (`security_event/*`) identify problematic inputs or abusive patterns.

- In social benefit scenarios:
  - episodes of filling out forms reveal which steps cause most friction or abandonment;
  - adjustments to UI text (`ds.ui_text_bundle_core_v1`) and flow can be guided by this data.

- In developer tools:
  - episodes of AI-assisted coding show which suggestions are accepted or rejected;
  - skills and prompts can be adjusted based on real usage patterns.

MOVA 4.1.0 defines the **episode frame** and **security event core** required to build genetic-layer solutions.  
Concrete schemas and envelopes for storing aggregated pattern memory (for example, pattern summaries or optimisation decisions) live in **skills** and **product** layers and are not part of the red core.

---

## 8. Relationship between episodes, scenarios and skills

Episodes are the **anchors** that connect scenarios and skills to actual behaviour.

Good practice:

- Each important step in a scenario should correspond to at least one episode:
  - planning steps → `plan/*` episodes;
  - execution steps → `execution/*` episodes;
  - security decisions → `security_event/*` episodes.

- Each skill that performs meaningful work should:
  - produce episodes with clear `episode_type` values;
  - reference the envelopes and data it processed;
  - record `executor` information that uniquely identifies the skill and its environment.

This approach enables:

- performance analysis of individual skills and scenarios;
- understanding how early decisions influence final outcomes;
- safe replacement or improvement of skills without losing historical context.

Executors are free to choose how to persist episodes, but the **shape** of episodes is fixed by the red core.

---

## 9. Role of MOVA-based experts and tools

MOVA 4.1.0 does not define a specific “MOVA expert” skill at the red core level.  
However, MOVA-based experts and tools are expected to use episodes and the genetic layer in the following ways:

- **Design assistance**

  - help authors design episode schemas that:
    - extend `ds.mova_episode_core_v1` appropriately;
    - use `episode_type` values consistent with the global catalog;
    - include enough information for analysis, without duplicating low-level logs.

- **Scenario instrumentation**

  - suggest where episodes should be added in scenarios:
    - after planning steps;
    - after user approvals or rejections;
    - after critical calls to external systems.

- **Analysis and evolution**

  - analyse accumulated episodes to:
    - detect patterns;
    - identify weak points in scenarios and skills;
    - propose changes to schemas, envelopes and instruction profiles.

In this way, episodes become more than logs.  
They form a **systematic memory** on top of which MOVA-based scenarios and the MOVA language itself can evolve.

---

## 10. Checklist for episode schema authors

When designing episode schemas in MOVA 4.1.0, follow this checklist:

1. **Base on the core**

   - Extend `ds.mova_episode_core_v1` (or `ds.security_event_episode_core_v1` for security events) via `allOf`.

2. **Use correct `episode_type`**

   - Choose a core id from `global.episode_type_catalog_v1.json` (`execution`, `plan`, `security_event`, `other`);
   - Add a clear subtype where needed (for example `execution/file_cleanup`).

3. **Capture executor and environment**

   - Include enough detail in `executor` to identify:
     - who or what performed the action;
     - in which environment (runtime, environment profile, version).

4. **Reference envelopes and data**

   - Add references to input envelopes and key data records where possible;
   - Add references to output data when the episode results in new or updated records.

5. **Record result status and summary**

   - Use `result_status` to classify the outcome;
   - Provide a short, clear `result_summary`.

6. **Keep logs and traces separate**

   - Do not embed full logs or traces inside episodes;
   - Store them elsewhere and reference them from the episode if needed.

7. **Align with security model where applicable**

   - For security events, use:
     - `security_event_type` and `severity` from `global.security_catalog_v1.json`;
     - `security_model_version` consistent with the active security model.

By following these rules, episodes remain:

- compact enough for everyday use;
- rich enough for audit and analysis;
- compatible with the genetic layer and future MOVA-based experts.
