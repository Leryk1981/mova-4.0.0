MOVA 4.1 — Constitutional Core (Draft)
0. Frame: what MOVA 4.1 is

MOVA 4.1 defines the constitutional core of the MOVA language. It is a specification of contracts, not an execution environment.

MOVA itself never executes any code. It does not define:

control flow,

scheduling,

network access,

storage operations,

or any imperative logic.

Execution is always delegated to external runtimes, services, agents and user interfaces.
MOVA describes what counts as a valid input, output or episode at the red core boundary. Everything beyond that is implementation.

MOVA 4.0.0 already introduced the main pillars:

ds.* — data schemas,

env.* — envelopes (speech-acts over data),

global.* — shared dictionaries,

verbs — canonical operations over data,

episode schemas for recording work.

MOVA 4.1 completes the constitutional layer on top of that foundation. It adds:

a formal episode core,

a minimal yet extensible security layer,

a clear layering and namespace policy (red core / skills / infra),

neutral contracts for runtimes and connectors,

and a strict separation between human-facing text and model instructions.

Once MOVA 4.1 is in place, the language can be used as a stable constitution for:

MOVA-based experts and assistants,

zero-code / low-code tooling for architects,

and self-improvement flows based on recorded episodes.

MOVA 4.1 itself does not ship an expert, zero-code interface or improvement loops.
It prepares the ground for them.

1. What belongs to MOVA 4.1 (constitutional core)

This section describes what is explicitly part of the red core in MOVA 4.1 and is represented in JSON as ds.*, env.* and global.* schemas and catalogs.

1.1. Primitives and dogmas

MOVA 4.1 fixes the following dogmas for the red core:

MOVA never executes

MOVA contains no executable code and defines no runtime behaviour.

Any system that claims support for MOVA must treat ds.*, env.*, global.*, verbs and episodes as contracts, not as code.

All execution (agents, services, workers, tools, browsers, UIs) is external to MOVA and is only constrained by these contracts.

Red core is vendor-neutral

Red core schemas must not depend on any specific vendor, platform or product.

Vendor or platform-specific details live in the infra layer, not in the red core.

Red core is stable and minimal

New red core elements are added only when they are clearly constitutional (affect the definition of the language itself).

Domain-specific types and product-specific schemas must be placed in skills or product layers, not in the red core.

In JSON, this dogma is reflected by:

the absence of any imperative fields (no “code”, “script”, “function body” etc.) in red core schemas;

the separation of runtime bindings and connectors into neutral descriptive schemas (ds.runtime_binding_core_v1, ds.connector_core_v1) without execution logic;

the presence of security events and instruction profiles as data, not as code.

1.2. Base form of ds-schemas

All red core data schemas share a common service shape defined by:

ds.mova_schema_core_v1.schema.json

This schema provides:

schema_id — canonical identifier of the schema instance (e.g. ds.mova_episode_core_v1);

schema_version — optional semantic version of the schema;

meta — metadata for humans and systems (titles, descriptions, localisation hints, etc.);

ext — extension area for non-core metadata.

Red core schemas must:

embed ds.mova_schema_core_v1 via allOf as the first core building block;

treat meta and ext as non-instructional fields:

they may contain descriptions, labels, localisation hints,

they must not contain direct execution instructions for an AI model.

The restriction on instructions in meta / ext is formalised in:

global.text_channel_catalog_v1.json — rule no_llm_instructions_in_meta_ext.

This ensures that:

all instructions for models are explicitly placed in dedicated fields and channels;

schema metadata stays safe and stable across tools and runtimes.

1.3. Episode frame (genetic layer core)

MOVA 4.1 standardises how episodes of work are recorded.

The base episode shape is defined by:

ds.mova_episode_core_v1.schema.json

This schema introduces:

episode_id — unique identifier of the episode;

episode_type — high-level classification of the episode;

mova_version — version of the MOVA model used when the episode was recorded;

recorded_at — timestamp of the episode;

executor — structured description of who executed the episode (role, id, kind, environment);

result_status and result_summary — status and short human-readable summary of the outcome;

optional references to input and output envelopes, so the episode can be linked back to concrete MOVA interactions.

Episode types follow a small core dictionary:

global.episode_type_catalog_v1.json

with core ids:

execution — an episode that captures actual execution of a scenario / skill / template;

plan — an episode that captures a plan or strategy to be executed later;

security_event — an episode that captures a security-relevant event or decision;

other — a generic bucket for domain-specific types.

The recommended format is:

episode_type = "<core_id>[/<subtype>]"

Examples:

execution/file_cleanup

execution/smartlink_route

plan/task

security_event/prompt_injection_suspected

For security-related episodes MOVA 4.1 defines a specialisation:

ds.security_event_episode_core_v1.schema.json

This schema extends ds.mova_episode_core_v1 with fields such as:

security_event_type

security_event_category

severity

policy_profile_id

policy_ref

security_model_version

recommended_actions

actions_taken

detection_source

detection_confidence

This is the canonical shape for all security events in MOVA.

1.4. Security layer (main new block in 4.1)

MOVA 4.1 adds a minimal but extensible security layer to the red core.
It has three main components:

Instruction profiles

Schema: ds.instruction_profile_core_v1.schema.json

Envelope: env.instruction_profile_publish_v1.schema.json (+ .example.json)

The instruction profile describes:

which executors, roles, envelopes and data types it applies to (applies_to);

a list of rules with:

rule_id

description (policy statement, not a runnable prompt)

effect (allow, deny, warn, log_only, transform)

target (kind and selector)

severity

on_violation (recommended actions).

Each profile includes:

profile_id, profile_version

security_model_version — the version of the MOVA security model this profile is written for;

status — draft, active, or deprecated.

Profiles are published to executors or guards using the envelope:

env.instruction_profile_publish_v1 with verb publish.

Security events and store

Schema: ds.security_event_episode_core_v1.schema.json

Envelope: env.security_event_store_v1.schema.json (+ .example.json)

Security events are recorded as specialisations of ds.mova_episode_core_v1.
They are stored using the envelope:

env.security_event_store_v1 with verb record,

roles:

producer — component that detected the event,

security_store — target log or store.

Security dictionaries

Catalog: global.security_catalog_v1.json

This catalog defines:

security_event_type — standard ids for categories of security events;

security_action_type — standard ids for actions (log, alert, block, fallback, etc.);

security_policy_profile — core profiles such as:

mova_security_default_v1 — default production-like profile,

mova_security_dev_v1 — relaxed development profile.

Each profile entry refers to a security_model_version, enabling evolution of the security model over time without breaking compatibility.

Together these elements ensure that:

security decisions are represented as structured data;

instruction policies are first-class citizens of MOVA;

the security layer is part of the constitutional red core, not an afterthought.

1.5. Layering and namespace policy

MOVA 4.1 formalises the separation between:

red core — the language constitution;

skills — domain-specific scenarios and templates;

infra — runtimes, vendors and bindings.

The canonical description is provided by:

global.layers_and_namespaces_v1.json

This catalog defines:

layers:

red_core (color: red)
The constitutional core of MOVA. Contains only vendor-neutral ds.*, env.*, global.* and verbs.

skills (color: yellow)
Domain skills and scenarios (file cleanup, Smartlink, social benefits, e-commerce, etc.).

infra (color: yellow)
Bindings to concrete runtimes and vendors (Cloudflare Workers, local processes, external APIs).

namespace rules for ds.*:

red core uses reserved prefixes such as mova, mova4, security, and core runtime/connector prefixes;

skills use their own domain prefixes (e.g. file_cleanup, task_planning, social, ecommerce, etc.) and must not use reserved red core prefixes;

infra uses connector_* and runtime_* prefixes for vendor-specific descriptions.

Domain-level schemas (for example ds.smartlink_config_v1) may appear in catalogs and examples, but they belong to the skills or product layer, not to the red core itself.

1.6. Red contracts for runtimes and connectors

MOVA 4.1 introduces two neutral data schemas that describe how execution and external systems are bound to MOVA without fixing any particular vendor.

Runtime binding core

Schema: ds.runtime_binding_core_v1.schema.json

This schema describes:

runtime_id, runtime_kind — identity and category of the runtime (serverless, edge, browser, local_process, etc.);

language, runtime_version — implementation language or platform and its version;

env_profile_id — environment profile id (dev, staging, prod, etc.);

binding_targets — what is bound to this runtime (template, scenario, skill, connector proxy, service);

capabilities — descriptive information about network, storage, secrets and queues.

This is not an execution specification. It does not define how to deploy or run anything.
It is a neutral description that can be consumed by different executors.

Connector core

Schema: ds.connector_core_v1.schema.json

This schema describes:

connector_id — canonical id of the connector;

provider — provider name or domain (openai, google, internal, etc.);

resource — service or resource name (chat, embeddings, calendar, sheets, etc.);

protocol — underlying protocol (http, https, grpc, custom);

auth_methods — supported authentication methods (none, api_key, oauth2, jwt, basic, etc.);

rate_limits — descriptive hints about rate limiting;

pagination — descriptive hints about pagination;

error_contract — description of error shapes and mappings.

Vendor-specific connectors (e.g. OpenAI Chat, Google Sheets) in the infra layer must extend this core form in their own schemas.

Both ds.runtime_binding_core_v1 and ds.connector_core_v1 are part of the red core catalog and are referenced from:

mova4_core_catalog.example.json

env.mova4_core_catalog_publish_v1.example.json

1.7. Rules for “human” vs “model” text

MOVA 4.1 formalises the separation between text that is:

shown to humans,

used as instructions for models,

or logged for technical purposes.

Text channel catalog

Catalog: global.text_channel_catalog_v1.json

It defines channels:

human_ui — text shown directly to the human user;

model_instruction — text intended only for an AI model as instructions or guidance;

system_log — technical messages for logging and diagnostics;

mixed_legacy — deprecated, for migration only.

And rules, including:

no_llm_instructions_in_meta_ext — meta and ext fields in ds.* must not contain direct execution instructions for models;

human_ui_must_not_contain_llm_instructions — human_ui text must not be used as prompts or instructions for an AI model;

model_instruction_not_shown_to_user — model_instruction text must never be shown directly to the user.

UI text bundle core

Schema: ds.ui_text_bundle_core_v1.schema.json

This schema defines a structured bundle of UI text with strict channel separation:

bundle_id — identifier of the text bundle;

context_id — optional context id (envelope id, step id, screen id);

role — logical role of the UI text (question, explanation, hint, error_message, success_message, section_title, other);

human_text:

channel = "human_ui"

text — text shown to the user, without model instructions;

model_text (optional):

channel = "model_instruction"

text — instruction or guidance for the model related to this UI element.

This design ensures that:

text for humans and text for models are clearly separated in data structures;

instructions can be audited, versioned and controlled as part of the MOVA language;

UI flows can be built with predictable behaviour and without hidden prompts in user-visible text.

2. What does not belong to MOVA 4.1 (4.2+ line)

Some important ideas are intentionally out of scope for MOVA 4.1.
They depend on the 4.1 core, but do not belong to the constitutional layer.

2.1. MOVA Expert

A MOVA expert is an assistant or agent that:

understands MOVA schemas, envelopes, catalogs and episodes;

can explain them to humans;

and can help author new ds/env/global/episode schemas.

Such an expert would:

use MOVA 4.1 contracts as its internal language,

interpret episodes (including security events) to improve its behaviour.

However:

MOVA 4.1 does not define how such an expert is implemented;

the expert will live above the red core, using MOVA as its constitution.

2.2. “Zero-code for the architect”

A zero-code interface for architects would provide:

UI-driven tools to define ds/env schemas, catalogs and scenarios without writing JSON manually;

integrated validation and publishing against the MOVA core catalog;

views over episodes, security events and instruction profiles.

MOVA 4.1 only defines:

the contracts that such tools must respect;

the data structures they would read and write.

The tools themselves are out of scope and belong to later versions (4.2+).

2.3. Self-improvement through episodes

A self-improvement layer would:

collect episodes of work (including failures and successes),

analyse them,

and update skills, instruction profiles and templates over time.

MOVA 4.1 provides the episode frame and security episode core needed for this.
The actual algorithms, pipelines and tooling for self-improvement are left for later iterations of MOVA and for concrete products built on top.

3. Checklist for MOVA 4.1

The following items summarise what needs to be present for MOVA 4.1 to be considered complete at the constitutional level.

Core ds / env / catalog

ds.mova_schema_core_v1.schema.json

ds.mova_episode_core_v1.schema.json

ds.mova4_core_catalog_v1.schema.json

env.mova4_core_catalog_publish_v1.schema.json + .example.json

mova4_core_catalog.example.json with:

all core data_types (including security, runtime, connector, UI text bundle);

core verbs (create, update, route, record, publish);

core envelopes (env.mova4_core_catalog_publish_v1, env.security_event_store_v1, env.instruction_profile_publish_v1, etc.);

core episode_types.

Security layer

ds.security_event_episode_core_v1.schema.json

env.security_event_store_v1.schema.json + .example.json

ds.instruction_profile_core_v1.schema.json

env.instruction_profile_publish_v1.schema.json + .example.json

global.security_catalog_v1.json

clear use of security_model_version across profiles and episodes.

Layering and namespaces

global.layers_and_namespaces_v1.json with:

definition of red_core, skills, infra;

namespace rules for ds/env/global in each layer.

Runtimes and connectors

ds.runtime_binding_core_v1.schema.json

ds.connector_core_v1.schema.json

both referenced from the core catalog and used as the basis for infra-level schemas.

Text channels and UI text bundles

global.text_channel_catalog_v1.json

ds.ui_text_bundle_core_v1.schema.json

enforcement (by convention and tooling) of:

no LLM instructions in meta / ext;

strict separation of human_ui and model_instruction text.

Episode types

global.episode_type_catalog_v1.json

consistent use of episode_type with core ids (execution, plan, security_event, other) and subtypes.