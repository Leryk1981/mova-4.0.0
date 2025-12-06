# MOVA 4.0.0 — Core Specification (Draft)

> Canonical language of this specification: **English for text and identifiers** (`ds.*`, `env.*`, `global.*`, `verbs`).  
> All schema names, envelope types, roles and statuses are fixed in English.

## 1. Scope

**MOVA (Machine‑Operable Verbal Actions)** is a language of machine‑operable agreements about data and actions. It defines:

- which **data structures** exist in a given MOVA universe;
- which **operations (verbs)** are allowed on this data;
- which **envelopes (env.*)** encode concrete requests, commands and events;
- how **episodes of system work** are recorded as structured entries;
- how a shared **semantic layer (global.*)** ties these elements into a single vocabulary.

MOVA itself **never executes anything**. It contains no imperative code, control flow or runtime.  
Execution (agents, services, workers, tools, user interfaces) always lives outside. Any executor that claims support for MOVA MUST treat it as a contract: what counts as a valid input request, a valid result and a valid episode.

This specification describes **MOVA version 4.0.0** as the current, active version of the language. Earlier branches (3.x) are handled in separate documents and are not part of this core spec.

---

## 2. Core principles

### 2.1. MOVA does not execute

MOVA does not contain business logic and does not describe *how* operations must be executed.  
It only defines:

- data structure;
- allowed operation types;
- validation rules at system boundaries.

Any executor working with MOVA is responsible for honouring these contracts **on input and output**: what enters and leaves the system must conform to the described schemas and envelopes.

### 2.2. Everything important is structured data

All meaningful artefacts (profiles, configurations, decisions, episodes, plans) are represented as typed JSON documents that conform to MOVA data schemas (`ds.*`).  

Free text may appear as the contents of individual fields, but **every interaction** is constrained by an explicitly defined structure that can be validated automatically.

### 2.3. Verbs are operation types, not implementations

MOVA defines a small canonical set of verbs, for example:

- `create`, `update`, `delete`,
- `validate`, `route`,
- `record`, `aggregate`,
- `explain`, `plan`.

A verb describes the **type of operation on data**, not the way it is implemented.  
Different executors may implement the same verb in different ways, but they MUST honour the declared contract for input and output data.

### 2.4. Envelopes are speech‑acts over data

Envelopes (`env.*`) encode concrete speech‑acts: “request a plan”, “record an episode”, “update a profile”.  
Each envelope ties together:

- a verb;
- data schemas (`ds.*`);
- participant roles (who initiates, who executes, who receives the result);
- contextual metadata.

Through envelopes, **intent** is formulated in a MOVA system. Envelopes are the points where a human, a service and an AI agent speak the same structured language.

### 2.5. Episodes record work as data

Episodes describe individual, meaningful steps of work as structured records:

- which input envelopes and data were used;
- which executor was involved;
- what result was produced;
- which decisions were made;
- which timestamps and tracing identifiers are associated with this step.

Episodes form the basis for:

- audit and reproducibility;
- analytics and process optimisation;
- a “genetic” or pattern memory: analysing many episodes to evolve schemas, envelopes and execution strategies.

### 2.6. Global is the semantic layer

The `global.*` family defines shared **dictionaries and vocabularies**:

- roles (participants in processes);
- resources;
- statuses;
- categories;
- event types, etc.

These definitions provide a **common terminology** for all schemas and envelopes.  
The global layer does not contain execution logic and does not define business rules — it is a semantic dictionary that `ds.*`, `env.*` and episode schemas rely on.

### 2.7. MOVA lives at system boundaries

MOVA does not need to describe an entire end‑to‑end scenario. Its natural place is at **red boundaries**, where:

- data crosses a trust boundary (user ↔ service, service ↔ agent);
- different technologies or runtimes meet;
- results must be recorded as episodes.

At these points MOVA defines the shape of data and speech‑acts. Internal implementation details, algorithms and optimisations remain the responsibility of individual executors.

---

## 3. Core primitives

### 3.1. Data schemas (`ds.*`)

A **data schema** (`ds.*`) defines the structure and invariants of a particular domain data type.  
Technically, each `ds.*` document is a JSON Schema (2020‑12) that includes:

- stable `$id` and `title`;
- explicit `type`, `properties`, `required`, `additionalProperties`;
- optional semantic metadata (`description`, `enum`, `format`, `examples`);
- optional references to global vocabularies (roles, statuses, categories).

Examples of MOVA data types:

- `ds.smartlink_config_v1`
- `ds.file_cleanup_snapshot_v1`
- `ds.mova_ai_bootstrap_pack_v1`

Schemas MUST be stable enough to support validation and long‑term storage of episodes. Incompatible changes are modelled as new versions with suffixes (`*_v1`, `*_v2`, etc.).

Data schemas **do not define execution logic**. They describe **what the data looks like**, not **what must be done with it**.

---

### 3.2. Verbs

A **verb** in MOVA describes a canonical type of operation on data. Verbs are used:

- in envelopes (`env.*`) — to express intent;
- in episodes — to describe what was actually done.

Typical verbs (non‑exhaustive):

- `create` — create a new record;
- `update` — modify an existing record;
- `delete` — logical or physical deletion;
- `validate` — check data against schemas and rules;
- `route` — choose a route or target environment based on data;
- `record` — persist an episode or result;
- `aggregate` — build an aggregate from several records;
- `explain` — provide a structured explanation of a result;
- `plan` — build a structured plan of future steps.

The core of MOVA does not fix a closed list of verbs, but it recommends keeping the set:

- **small, clearly described and reusable**;
- documented in a shared verbs catalogue.

New verbs should be added only when they represent a **distinct, stable operation type**, not just another endpoint or internal method.

#### 3.2.1. Extending the MOVA verb catalogue

The verbs catalogue is a shared resource and should be extended carefully.  
Its purpose is to fix a small set of abstract operation types that can be reused across many domains and scenarios.

**Criteria for introducing a new verb:**

- the verb describes a **general, reusable kind of action**, not a specific technology, protocol or endpoint;
- its semantics is useful **across multiple scenarios or domains**, not only in one narrow case;
- it is possible to clearly state:
  - what the verb does in terms of data,
  - which `ds.*` and `env.*` types it typically accompanies,
  - what results and episodes are expected.

**What should not go into the global verbs catalogue:**

- names tied to a specific technology or transport, e.g.  
  `send_email_gmail`, `cf_worker_run`, `http_post_json`;
- verbs that essentially describe internal details of a single executor and do not generalise.

Such actions can be implemented as concrete skills or plugins that realise existing verbs (`notify`, `execute`, `fetch_data`, …), without adding a new global verb.

**Recommended extension process:**

1. Draft a proposal in the verbs catalogue (e.g. `global.verbs_catalog_v1`), specifying:
   - verb identifier (English);
   - short semantic description;
   - typical `ds.*` / `env.*` pairs;
   - example scenarios.
2. Check that the new verb does not duplicate existing ones semantically.
3. Once agreed, mark the verb as **stable** and start using it in new envelope and episode schemas.

The semantics of already accepted verbs must remain stable.  
If semantics needs to change, a **new verb** with a different identifier should be introduced, and the old one marked as deprecated in the catalogue, without retroactively changing its meaning.

---

### 3.3. Envelopes (`env.*`)

An **envelope** (`env.*`) is a concrete speech‑act: a structured statement like “someone does something with some data for a given purpose”.

A typical envelope includes:

- `envelope_type` — full envelope name (e.g. `env.file_cleanup_plan_request_v1`);
- `mova_version` — MOVA version (e.g. `4.0.0`);
- `envelope_id` or other identifiers;
- `verb` — one of the verbs (`route`, `validate`, `record`, `plan`, …);
- `roles` — references to roles from the global layer: initiator, executor, result recipient;
- `data` — nested objects referencing `ds.*` schemas (input data, context, expected result);
- `meta` — correlation IDs, timestamps, technical context.

Technically, an envelope definition is also a JSON Schema which **binds together**:

- the verb;
- data types;
- roles;
- required attributes of the speech‑act.

Executors (agents, services, tools) read these definitions and implement the actual behaviour. MOVA does not dictate how they route or store these operations; it only defines the shape of requests and responses.

---

### 3.4. Episodes

An **episode** is a structured record of one meaningful step of work. It usually contains:

- identifiers and timestamps;
- references to:
  - input envelopes,
  - key data records (`ds.*`),
  - executors and environments;
- result description (success / error / partial result);
- a brief summary of important decisions;
- optional diagnostic information (logs, metrics, traces, explanations).

Episodes are described by dedicated schemas (e.g. `ds.episode_*`).  
They are created when **something meaningful happens**: a decision is made, a plan is built, a document is produced, or a significant change is committed.

Episodes are the basis for:

- audit and compliance;
- analytics and process optimisation;
- building the system’s “genetic memory”.

MOVA does not prescribe retry, compensation or recovery policies. These belong to executors. However, episodes MUST contain enough structured context to support such mechanisms outside of MOVA.

---

## 4. Executors and boundaries

MOVA assumes the presence of one or more **executors**:

- AI models and agents;
- backend services and workers;
- command‑line tools;
- graphical interfaces and automation platforms.

Executors:

- read envelopes and data schemas;
- perform actual operations (API calls, computation, storage changes);
- emit new data records, envelopes and episodes.

At every external boundary — where requests enter or leave — MOVA schemas act as **contracts**:

- input data MUST conform to their `ds.*` and `env.*` schemas;
- results and episodes MUST also conform to their schemas;
- deviations from schemas should be treated as contract violations and handled explicitly.

MOVA does not define orchestration, deployment or scaling rules. Different systems may use MOVA:

- inside a single service;
- across services;
- between a human and an agent.

In all such cases MOVA plays the same role: a clear shared language for data and actions at boundaries.

---

## 5. Versioning

- The current core version described in this document is **`4.0.0`**.
- Individual data and envelope schemas use version suffixes:
  - `*_v1`, `*_v2`, … for incompatible structural or semantic changes;
  - backwards‑compatible changes should avoid breaking existing episodes and scenarios.

Documents describing historical MOVA versions and migration rules (for example from 3.6.x to 4.0.0) may be published separately and are not part of this core specification.
