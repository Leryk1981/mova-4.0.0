# MOVA 4.0.0 — Layered Model (Draft)

> Canonical language of this document: **English for text and identifiers** (`ds.*`, `env.*`, `global.*`, `skill.*`, etc.).  
> This document explains how the MOVA language is embedded into larger systems through a layered architecture.

## 1. Purpose

The core MOVA 4.0.0 specification describes the language itself: data schemas (`ds.*`), envelopes (`env.*`), the global semantic layer (`global.*`) and episode schemas.

This document describes the **layered model**, in which MOVA is used:

- as a **static language core** (core layer);
- on top of which **skills and executors** are built (skills / executors layer);
- and on top of which **products and user experiences** are created (applications / UX layer).

The goal is to clearly separate responsibilities between layers, define allowed dependencies and show where MOVA is applied as a contract for data and actions.

---

## 2. Layer overview

In a practical MOVA‑based system we can distinguish three conceptual layers:

1. **MOVA core layer**  
   - language of contracts about data, actions and episodes;  
   - consists of `ds.*`, `env.*`, `global.*`, `ds.episode_*`;  
   - contains no executable code.

2. **Skills and executors layer**  
   - concrete implementations of operations defined by MOVA contracts;  
   - skills (`skill.*`), connectors, adapters to external systems;  
   - bind MOVA to concrete runtimes (Node.js, Python, Workers, etc.).

3. **Products and experience layer (applications / UX)**  
   - applications, interfaces and usage scenarios;  
   - developer tools, admin consoles, end‑user applications;  
   - compose skills into end‑to‑end flows for specific tasks.

Each layer has its own responsibility and can evolve independently, as long as MOVA contracts at the boundaries stay valid.

---

## 3. MOVA core layer

### 3.1. Contents

The MOVA core includes:

- **Data schemas (`ds.*`)** — formal models of domain entities;  
- **Envelopes (`env.*`)** — structured speech‑acts over data;  
- **Global semantic layer (`global.*`)** — shared vocabularies of roles, statuses, resources, categories;  
- **Episode schemas (`ds.episode_*`)** — structures for recording work steps.

These components define **what data is**, **which actions are considered valid** and **how results are recorded**.

### 3.2. Properties

The core layer has the following properties:

- **Static and implementation‑agnostic**  
  It contains no executable code and depends on no specific technologies (databases, clouds, frameworks). It can be published as a separate repository or package, imported by other systems **read‑only**.

- **Stable contracts**  
  Changes to core schemas must be done carefully and with version control. Incompatible changes are introduced as new versions (`*_v2`, `*_v3`), without retroactively altering semantics of already used schemas.

- **Used at system boundaries**  
  The core is applied where data crosses well‑defined boundaries:
  - user ↔ service;
  - service ↔ service;
  - service ↔ AI agent;
  - work episodes being recorded.

### 3.3. Role in the overall architecture

The core layer defines:

- which data types exist in the system;
- which verbs are canonical;
- how speech‑acts (env.*) are structured;
- how episodes are shaped.

All other layers (skills, applications) build on these definitions.  
The core does not invoke external systems and is unaware of concrete execution strategies.

---

## 4. Skills and executors layer

### 4.1. Purpose

The skills and executors layer is responsible for **actual execution** of actions described by MOVA. It:

- accepts envelopes (`env.*`) and data (`ds.*`) as input;
- performs necessary operations (file handling, API calls, computation, routing);
- returns new data, envelopes and episodes.

This layer materialises MOVA verbs in concrete program code and infrastructure.

### 4.2. Skills

A **skill** is a discrete, well‑defined unit of execution which:

- implements one or more operation types (verbs) over MOVA data;
- has an explicit contract:
  - input envelope of type `env.*`,
  - output type `ds.*` or `env.*`,
  - possible episode types `ds.episode_*`;
- may have its own manifest (purpose, constraints, dependencies).

Skills may be:

- simple (few steps, single executor);
- complex (internally invoke other skills or external services).

Important: skills **MUST** honour MOVA contracts at their boundaries:

- accept valid envelopes;
- emit data and episodes that conform to their schemas.

### 4.3. Executors, connectors, plugins

This layer includes:

- **executors** — workers, services, CLI tools, AI agents that actually run code;
- **connectors** to external systems (HTTP APIs, databases, cloud services);
- **plugins / adapters** that encapsulate platform‑specific details.

From MOVA’s perspective:

- connectors and plugins **are not verbs**;  
- they are **implementation mechanisms** for verbs (`fetch_data`, `notify`, `route`, `validate`, etc.) in concrete environments.

The fact that a skill uses a connector to a certain platform does not change the meaning of the MOVA contract. At the language level only what happened to the data matters, not which tool was used.

### 4.4. Allowed dependencies

The skills layer:

- **may** depend on the MOVA core (schemas, envelopes, global layer);
- **may** depend on concrete runtimes, libraries, cloud SDKs;
- **must not** introduce reverse dependencies into the core (the core must not reference specific skills, plugins or connectors).

This keeps the core independent, while skills can evolve and change implementations without breaking language contracts.

---

## 5. Products and experience layer (applications / UX)

### 5.1. Purpose

The products and experience layer is responsible for:

- building **complete scenarios** for end users (humans or other systems);
- providing **interfaces** in which these scenarios are accessible:
  - IDE extensions;
  - web applications;
  - mobile clients;
  - command‑line tools;
  - dashboards and consoles.

This is where:

- application‑level business logic appears;
- orchestration of skill sequences is implemented;
- user experience (UX), texts and explanations are defined.

### 5.2. Using MOVA in products

Products can use MOVA:

- **as an internal contract language**:  
  all internal interactions are described via `ds.*`, `env.*`, `ds.episode_*`;
- **as part of their API**:  
  external clients send and receive data in MOVA format;
- **as a logging / audit format**:  
  episodes are stored in a unified structure and can be analysed by different tools.

Examples of product‑layer roles:

- an IDE extension that:
  - reads MOVA schemas and envelopes;
  - helps developers author valid JSON documents;
  - invokes skills to run scenarios.
- a web application that:
  - collects user profiles according to MOVA schemas;
  - triggers scenarios (via skills) to generate documents or plans;
  - displays results stored as episodes.

### 5.3. Dependencies

The product layer:

- depends on the **MOVA core** (to understand data and actions);
- depends on the **skills and executors layer** (to run scenarios);
- **does not change** language contracts in the core (but may initiate their extension through a formal process).

---

## 6. Dependency directions

Allowed dependency directions can be summarised as:

- Products (applications / UX) → skills / executors → MOVA core.
- The core **does not depend** on skills or products.
- Skills **must not** force the core to change definitions retroactively; new needs should be expressed as:
  - new data schemas (`ds.*`);
  - new envelopes (`env.*`);
  - new global dictionary entries (`global.*`);
  - new versions of existing schemas.

Thus:

- the core remains a **stable contract**;
- the skills layer is responsible for **correct execution** of that contract;
- the product layer provides **usable experiences** for humans and systems without breaking contract boundaries.

---

## 7. Practical use of the layered model (high‑level)

A few typical patterns (without project‑specific details):

1. **Preparing a profile for an AI agent**  
   - core: `ds.mova_ai_bootstrap_target_v1`, `ds.mova_ai_bootstrap_pack_v1`, `env.mova_ai_bootstrap_generate_v1`;  
   - skill: `skill.mova_ai_bootstrap_generate_*` to build the profile from a target description;  
   - product: an interface where a user defines the target, runs the skill and receives a ready profile.

2. **Directory analysis and cleanup plan**  
   - core: `ds.file_cleanup_target_v1`, `ds.file_cleanup_snapshot_v1`, `ds.file_cleanup_plan_v1` and corresponding `env.*`;  
   - skills: `skill.file_cleanup_snapshot_*`, `skill.file_cleanup_plan_*`;  
   - product: a tool or UI where a user selects a directory, reviews the plan, approves or adjusts it.

3. **External tool integration**  
   - core: `ds.*` and `env.*` that describe the tool’s input parameters and results;  
   - skill: a wrapper around CLI / HTTP API that calls the tool and maps results into MOVA schemas;  
   - product: a system that orchestrates tool runs, presents results and analyses episodes.

In all cases, the structure remains the same:  
**MOVA defines data and speech‑acts**, skills **implement actions**, and products **compose them into scenarios**.

---

## 8. Conclusion

The MOVA 4.0.0 layered model allows us to:

- clearly separate the **language** from **implementation** and **user experience**;
- build various systems (developer tools, applications, analytics dashboards) on top of a shared language core;
- evolve skills and products without breaking language contracts.

The MOVA core defines a single language for data and actions.  
The skills and executors layer ensures correct execution of this language in concrete technologies.  
The products and experience layer makes this language accessible and useful for humans and other systems.
