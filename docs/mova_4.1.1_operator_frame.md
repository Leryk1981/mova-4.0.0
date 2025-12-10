# MOVA 4.1.1 – Operator Frame

MOVA 4.1.1 introduces the **operator frame** as the official lens for auditing the language and products. It does not add new JSON schemas; instead, it provides a set of questions that every red-core artefact, episode, and security workload should satisfy. The frame is used to reason about intent, execution, risk and evolution without changing `_core_v1` contracts.

## The operator questions

| axis      | question                                   | typical MOVA mapping                                        |
|-----------|---------------------------------------------|--------------------------------------------------------------|
| what      | What action is being performed?             | `env.*`, verb, envelope payload                              |
| how       | How is it executed?                         | runtime binding, skills, connectors                          |
| where     | Where does it run?                          | runtime id/profile, infra context                            |
| when      | When does it happen?                        | lifecycle step, trigger, frequency                           |
| why       | Why this behaviour/policy?                  | policy rationale, catalog entries, constraints               |
| forWhat   | For what outcome or value?                  | expected result, user/business value                         |
| who       | Who is involved?                            | roles in envelopes, executor fields                          |
| howMuch   | How much resource/cost/limit?               | quotas, budgets, time bounds                                 |
| risks     | What are the key risks?                     | security catalog, policy rules, mitigations                  |
| result    | What does success/failure look like?        | `result_status`, `result_summary`, outputs                   |
| context   | In what environment/context?                | meta/ext references, text channels, surrounding data         |
| lifecycle | How does it live over time?                 | creation/update/archive/delete, versioning                   |
| metrics   | What and how do we measure?                 | episode metrics, aggregations, genetic-layer signals         |

## How operator frame maps to MOVA

- `ds.*` schemas express **what** and part of the **context**.
- `env.*` envelopes capture **what**, **when**, **who**, and pieces of **why/forWhat**.
- Episodes (`ds.mova_episode_core_v1` and specialisations) record **result**, **risks**, **metrics**, **lifecycle**, and **context**.
- `global.*` catalogs stabilise vocabularies for **why**, **risks**, **metrics**, **roles**, **layers**.
- Security layer emphasises **risks**, `policy_profile_id`, `security_model_version`, `actions_taken`.
- Text/UI layer influences **context** and **who** (which actors see which text channels).

## Example: applying the frame to a security event

- what — security event `security_event/prompt_injection_suspected` recorded via `env.security_event_store_v1`.
- who — active guard/executor with `policy_profile_id = mova_security_default_v1`.
- where — executor + security store (see envelope roles and runtime docs).
- when — during handling of `env.instruction_profile_publish_v1` (or related execution step).
- why — policy violation (`security_event_type`) against the active profile.
- risks — prompt injection leading to instruction leakage or model behaviour drift.
- result — event recorded; `actions_taken` include `block` + `alert`.
- metrics — contributes to genetic-layer aggregation of security signals.

## Example: applying the frame to MOVA core catalog

- what — publishing the red-core catalog (`env.mova4_core_catalog_publish_v1` with `ds.mova4_core_catalog_v1`).
- why — enable executors/registries to validate red-core contracts.
- where — registry / executor scope.
- lifecycle — version updates (4.1.0 → 4.1.1) without breaking contracts.
- metrics — coverage of required red-core artefacts, absence of domain contamination.

## Status in MOVA 4.1.1

- The operator frame is a **normative text document** (no JSON schema) for 4.1.1.
- It is required for auditing the red core, designing domain episodes, and designing security policy profiles.
- Future versions may add `ds.operator_frame_*`, but 4.1.1 formalises the frame textually.
