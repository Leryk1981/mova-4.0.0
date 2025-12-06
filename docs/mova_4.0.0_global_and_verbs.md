# MOVA 4.0.0 — Global Layer and Verbs (`global.*` and verbs)

> Audience: authors of MOVA schemas and skills, and the **MOVA expert** skill, which helps maintain a consistent vocabulary and verb catalogue.

## 1. Purpose of the global layer (`global.*`)

The global layer (`global.*`) is MOVA’s **semantic reference layer**.  
Its purpose is to provide a stable shared vocabulary for all data schemas (`ds.*`), envelopes (`env.*`) and episodes.

The global layer includes:

- role dictionaries;
- resource dictionaries;
- status dictionaries;
- category dictionaries;
- other reference lists of values reused across schemas.

The global layer **does not contain execution logic** and does not define business processes.  
It is a **dictionary / registry** on which other parts of MOVA depend.

---

## 2. Types of global entities

Typical `global.*` groups:

1. **Roles (`global.roles.*`)**  
   Examples: `user`, `agent`, `executor`, `service`, `auditor`.  
   Used in envelopes (`env.*`) and episodes to denote who initiates the action, who executes it, who receives the result.

2. **Resources (`global.resources.*`)**  
   Examples: `file_system`, `http_api`, `kv_store`, `calendar`, `repository`.  
   Help describe which resource a skill or scenario interacts with.

3. **Statuses (`global.statuses.*`)**  
   Examples: `pending`, `in_progress`, `completed`, `failed`, `partial`.  
   Used in data and episodes to provide a uniform state vocabulary.

4. **Categories and event types (`global.categories.*`, `global.events.*`)**  
   For example: types of episodes, error categories, plan types.

Each such dictionary may have its own JSON Schema (`ds.global_*`) or be embedded into a `global.*` document.

---

## 3. Design principles for the global layer

1. **Consistency**  
   A role or status name should mean the same thing wherever it appears.

2. **Small but stable vocabularies**  
   Avoid creating many nearly‑identical statuses or roles. A small, well‑defined set is better than a large fuzzy one.

3. **Versioning instead of retroactive changes**  
   If a value needs to change meaning, introduce a new value or dictionary and mark the old one as deprecated, instead of rewriting its definition retrospectively.

4. **Schema integration**  
   Global values should be used via:
   - `enum` in `ds.*` schemas;
   - `$ref` to dedicated `ds.global_*` schemas;
   - explicit mention of the global dictionary in `description` fields.

This keeps the terminology aligned across the language.

---

## 4. Verbs in MOVA

Verbs describe **types of operations** on data and episodes.  
They are used in:

- envelopes (`env.*`) — to express intent;
- episodes — to describe what was actually done.

Examples:

- `create`, `update`, `delete`,
- `validate`, `route`,
- `record`, `aggregate`,
- `explain`, `plan`.

A verb **does not describe technology or transport**.  
It is an abstract action type, which can be implemented by different executors.

---

## 5. Verbs catalogue

It is recommended to maintain a dedicated **verbs catalogue**, for example:

- as a JSON document `global.verbs_catalog_v1.json`, or
- as a text document `global_verbs_catalog.md`.

For each verb in the catalogue, record at least:

- identifier (in English): `plan`, `record`, `validate`, etc.;
- short semantic description:
  - what the verb does in terms of data;
- typical `ds.*` / `env.*` pairs:
  - examples of schemas and envelopes using this verb;
- expected result / episode types:
  - whether an episode is produced,
  - whether data is persisted or changed.

The verbs catalogue is part of the global layer and serves as a reference for all schema and skill authors.

---

## 6. Extending the verbs catalogue

### 6.1. When to add a new verb

Add a new verb only when:

- it represents a **general, reusable operation type**, not a specific endpoint or protocol;
- it can be used in multiple scenarios or domains;
- its semantics clearly differs from existing verbs.

Example:  
introducing `plan` as a separate verb for structured plan generation is justified;  
introducing `generate_markdown_plan` as a verb is not — this is an implementation detail of a skill.

### 6.2. When NOT to add a new verb

Avoid adding verbs when:

- names are tightly bound to a technology:  
  `send_email_gmail`, `cf_worker_run`, `http_post_json`;
- the action does not generalise beyond one executor;
- the action can be expressed as a combination of an existing verb and skill configuration.

Such cases are better handled via skills / plugins, not by expanding MOVA’s global verb set.

### 6.3. Extension process

Recommended process:

1. Draft a proposal in the verbs catalogue including:
   - identifier,
   - semantic description,
   - usage examples,
   - typical `ds.*` / `env.*` types.
2. Check that the proposed verb does not duplicate an existing one.
3. Once agreed, mark the verb as stable and use it in new schemas.

If semantics of an existing verb needs to change, then:

- add a new verb with a different identifier;
- mark the old one as deprecated in the catalogue;
- do not rewrite its meaning historically.

---

## 7. Role of `MOVA expert` for `global.*` and verbs

The **MOVA expert** skill can use this document to:

- guide proposals for new roles, statuses and categories;
- decide when a new verb is justified;
- run structural checks such as:
  - whether new schemas introduce local roles that duplicate `global.*` entries;
  - whether “local verbs” are used where a global verb should be referenced instead.

In this way, `MOVA expert` helps keep the global layer coherent and the verbs catalogue small, clear and reusable.
