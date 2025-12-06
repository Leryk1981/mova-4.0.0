# MOVA 4.0.0 — Episodes and Genetic Layer (Pattern Memory)

> Audience: authors of episode schemas, skill developers, and the **MOVA expert** skill, which helps correctly record system work results.

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

---

## 2. Minimal contents of an episode

Regardless of domain, most episodes should contain at least:

1. **Identifiers and time**  
   - unique episode identifier;  
   - timestamps (start, end, or at least record time).

2. **References to input data**  
   - one or more envelopes (`env.*`) used by the executor;  
   - key data records (`ds.*`) relevant for context.

3. **Executor and environment**  
   - who or what performed the action (human, service, AI agent);  
   - technical environment (runtime, skill or service version).

4. **Result**  
   - status (`completed`, `failed`, `partial`, …);  
   - short summary in structured or text form;  
   - references to new or changed data records (`ds.*`), if any.

5. **Additional context (optional)**  
   - logs;  
   - metrics;  
   - traces;  
   - explanations.

Concrete episode schemas (`ds.episode_*`) may extend this set of fields, but should not drop the basic attributes completely.

---

## 3. When to create an episode

An episode should be recorded when:

- an **important decision** has been made (e.g. a plan selected, a routing decision taken, changes approved);
- **substantial data changes** occurred (profile updated, document generated, plan produced, etc.);
- a **coherent scenario step** completed that matters for analysis or audit.

Not every low‑level technical operation needs its own episode.  
Focus on **meaningful milestones** — points where the scenario could have diverged, or where a decision affects the future path.

---

## 4. Genetic layer (pattern memory)

The **genetic layer** (pattern memory) is the layer where:

- many episodes of system work are stored;
- episodes are analysed by aggregators;
- based on this analysis:
  - schemas (`ds.*`) are improved;
  - envelopes (`env.*`) are refined;
  - skills and execution strategies are adjusted.

The genetic layer **is not a machine‑learning model**.  
It is a layer of **data about system experience**.

Examples of use:

- in Smartlink‑type scenarios — analysing routing decision episodes: which rules led to better conversion;
- in social benefit scenarios — analysing form‑filling episodes: which steps cause the most friction;
- in developer tools — analysing AI coding episodes: which suggestions were helpful and which were not.

---

## 5. Episode structures in MOVA

In MOVA, episodes are described by `ds.episode_*` schemas.  
Typical elements:

- `episode_id` — unique identifier;
- `episode_type` — category (e.g. `file_cleanup_plan_review`, `smartlink_routing_decision`);
- `mova_version` — MOVA version used for this episode;
- `input_envelopes` — references to envelopes the executor worked with;
- `input_data_refs` — references to key `ds.*` objects;
- `executor` — executor description (role, identifier, environment type);
- `result_status` — status (success / failure / partial / cancelled);
- `result_summary` — short explanation;
- `output_data_refs` — references to new / changed records;
- `meta` — technical context, correlation IDs, etc.

Concrete schemas may add:

- quality / rating fields;
- user feedback fields;
- structured explanations;
- fields for aggregation and analytics.

---

## 6. Relationship between episodes, scenarios and skills

Episodes should be:

- **clearly linked** to the skills that produced them:
  - via skill identifier,
  - via implementation version;
- **anchors** in scenarios:
  - a scenario can be decomposed into a sequence of episodes,
  - each episode corresponds to a single meaningful step.

This enables:

- performance analysis of individual skills;
- understanding how early decisions affect final outcomes;
- replacing or improving parts of a scenario without losing history.

---

## 7. Role of `MOVA expert` in episode design

The **MOVA expert** skill can:

- assist in designing `ds.episode_*` schemas so that they are:
  - general enough for analytics,
  - not overloaded with trace‑level details;
- suggest where episodes should be added in a scenario:
  - after plan building (`plan` verb),
  - after a user approves a decision,
  - after a critical step is executed;
- analyse accumulated episodes to:
  - detect patterns,
  - propose evolution of schemas and envelopes.

In this way, episodes become more than logs: they form a **system memory**, from which MOVA‑based scenarios and the language itself can evolve.
