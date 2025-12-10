# MOVA 4.1.1 — Text Channels and UI Layer (Core)

> Audience: product/UX designers, schema authors, and tool builders who manage human-facing text and model instructions in MOVA-based systems.

This document describes how MOVA 4.1.1 separates and governs **human-facing text**, **model instructions**, and **system/log text**. It is a **patch update** over 4.1.0 with no breaking JSON changes. The text/UI layer is part of the red core and relies on two mandatory artefacts:

- `ds.ui_text_bundle_core_v1.schema.json` — structured bundles of UI text.
- `global.text_channel_catalog_v1.json` — canonical catalog of text channels and rules.

It is also aligned with:

- `ds.mova_schema_core_v1.schema.json`
- `ds.mova_episode_core_v1.schema.json`
- `ds.mova4_core_catalog_v1.schema.json`
- `global.layers_and_namespaces_v1.json`

## What’s new in 4.1.1 (text & UI layer)

- `ds.ui_text_bundle_core_v1` and `global.text_channel_catalog_v1` are fixed as mandatory red-core artefacts.
- Bundles must use channel ids from the global catalog; ad-hoc channels are disallowed.
- Rules for separating human vs model vs log text are made explicit and tied to catalog categories.

---

## 1. Purpose

MOVA treats text as **structured data**. The goals of the text/UI layer are to:

- clearly separate text for humans, for models, and for logs;
- make UI content auditable, versionable, and safe against accidental prompt injection;
- let tools and executors reason about text just like data and episodes.

Core building blocks:

- `global.text_channel_catalog_v1.json` — definitions and rules for text channels;
- `ds.ui_text_bundle_core_v1.schema.json` — structured containers for UI text with channels.

---

## 2. Core artefacts for the text/UI layer

- `ds.ui_text_bundle_core_v1` — required red-core form for grouping UI text per context/role.
- `global.text_channel_catalog_v1` — required red-core catalog of channel ids, visibility, and rules.

Product requirements:

- Every bundle must reference channel ids defined in `global.text_channel_catalog_v1`.
- Human-facing content goes to `human_ui`; model instructions go to `model_instruction`; technical diagnostics go to `system_log`.
- New channels must be added by updating the global catalog, not ad-hoc inside products.

---

## 3. Text channels (catalog)

Defined in `global.text_channel_catalog_v1.json`:

1. `human_ui` — text shown directly to humans (questions, explanations, hints, messages, titles); must not contain LLM instructions.
2. `model_instruction` — instructions or guidance for models; never shown to users.
3. `system_log` — technical/log text; not prompts and not user-facing.
4. `mixed_legacy` — deprecated migration channel; not for new designs.

Catalog rules reinforce:

- no LLM instructions in `meta`/`ext` of `ds.*` records;
- `human_ui` is never reused as a prompt;
- `model_instruction` is never shown to users;
- `system_log` is not used as a prompt.

---

## 4. UI text bundles

### 4.1. Core schema

UI text is structured using `ds.ui_text_bundle_core_v1.schema.json`. Typical fields:

- `bundle_id` — identifier (for example `personal_profile.address.street_number.info`).
- `context_id` (optional) — where this bundle applies (envelope id, form/step id, scenario id).
- `role` — logical role, e.g. `question`, `explanation`, `hint`, `error_message`, `success_message`, `section_title`, `other`.
- `human_text` — required object:
  - `channel` must be `human_ui` (catalog id).
  - `text` shown directly to the user.
  - `lang` optional (IETF tag).
- `model_text` — optional object:
  - `channel` must be `model_instruction`.
  - `text` instruction/guidance for the model.
  - `lang` optional.
- `log_text` — optional object:
  - `channel` must be `system_log`.
  - `text` diagnostic/log text; never a prompt or user-facing.
  - `lang` optional.

The schema keeps `_core_v1` identifiers unchanged; 4.1.1 only clarifies channel alignment and separation.

### 4.2. Separation of concerns

- **Human text (`human_ui`)** — clean UI copy; must not contain model prompts.
- **Model instructions (`model_instruction`)** — guidance for executors/models; never shown to users.
- **Logs (`system_log`)** — technical diagnostics; never used as prompts and never shown directly to users.
- **Deprecated (`mixed_legacy`)** — not used in new bundles; keep for migration only when explicitly required.

### 4.3. Example

```json
{
  "bundle_id": "social.personal_profile.birth_date.question",
  "context_id": "ds.personal_profile_v1_de",
  "role": "question",
  "human_text": {
    "channel": "human_ui",
    "lang": "en",
    "text": "Please enter your date of birth as it appears in your official documents."
  },
  "model_text": {
    "channel": "model_instruction",
    "lang": "en",
    "text": "Ask the user for their date of birth in a calm, clear tone. Do not explain legal details here; focus only on the format and importance of accuracy."
  },
  "log_text": {
    "channel": "system_log",
    "text": "Rendered birth date question bundle; awaiting user input."
  }
}
```

---

## 5. Alignment with global.text_channel_catalog_v1

- `human_text.channel`, `model_text.channel`, and `log_text.channel` **must** use ids from `global.text_channel_catalog_v1`.
- New channels require updating `global.text_channel_catalog_v1`; do not invent ad-hoc ids inside products.
- Executors and tooling should validate bundles against both the schema and the catalog to prevent mixed or misplaced text.
- Namespaced extensions are acceptable only after being added to the catalog; core ids (`human_ui`, `model_instruction`, `system_log`) must remain available.

---

## 6. Relation to schemas, envelopes, and episodes

- Data schemas (`ds.*`) describe structure and validation; they may reference bundles via `context_id` but must not embed prompts.
- Envelopes (`env.*`) may reference bundles (for example by step id) but should not carry large UI text directly.
- Episodes can record which `bundle_id` was used, enabling UX analytics and auditing of text exposure.

---

## 7. Responsibilities of tools and executors

- **Enforce channel separation**  
  Validate that `human_text.channel = "human_ui"`, `model_text.channel = "model_instruction"`, and `log_text.channel = "system_log"` when present; prevent use of `human_text` as prompts.

- **Respect catalog rules**  
  Apply rules from `global.text_channel_catalog_v1.json` (no LLM instructions in `meta/ext`; model text not shown to users; logs not used as prompts).

- **Support bundles**  
  Load and serve `ds.ui_text_bundle_core_v1` documents; select bundles by `context_id`, role, and language; render `human_text` to UI; deliver `model_text` to models when applicable.

- **Integrate with episodes**  
  Record which bundles were shown or applied, to support UX analysis and safety auditing.

---

## 8. Checklist for text and UI design in MOVA 4.1.1

- Use text channels: assign each text to `human_ui`, `model_instruction`, or `system_log`; avoid `mixed_legacy` for new work.
- Create UI text bundles: use `ds.ui_text_bundle_core_v1` per question/section/message; set `bundle_id` and `context_id`.
- Keep instructions separate: store model-specific text only in `model_instruction` channels; keep user-facing text clean.
- Link to schemas and episodes: connect UI text to data/envelopes via `context_id`; track bundle usage in episodes for analysis.
- Support evolution: plan localisation/variants by duplicating bundles or using language tags, without mixing channels or prompts.
