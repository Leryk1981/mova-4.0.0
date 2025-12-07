# MOVA 4.1.0 — Text Channels and UI Layer

> Audience: product and UX designers, schema authors, and tool builders who manage human-facing text and model instructions in MOVA-based systems.

This document describes how MOVA 4.1.0:

- separates **human-facing text** and **model instructions**,
- structures UI text as data,
- and uses `global.*` catalogs and `ds.*` schemas to keep interfaces safe and consistent.

It is aligned with the following schemas and catalogs:

- `global.text_channel_catalog_v1.json`
- `ds.ui_text_bundle_core_v1.schema.json`
- `ds.mova_schema_core_v1.schema.json`
- `ds.mova_episode_core_v1.schema.json`
- `ds.mova4_core_catalog_v1.schema.json`
- `global.layers_and_namespaces_v1.json`

---

## 1. Purpose

MOVA 4.1.0 treats text as **structured data**, not as an unregulated stream of strings.

The goals of the text and UI layer are:

- to **clearly separate**:
  - text shown to humans,
  - text used as instructions for AI models,
  - technical log text;
- to make UI content **auditable and versionable**;
- to prevent accidental “prompt injection” through UI copy and metadata;
- to enable tools and experts to **reason about text** in the same way as about data and episodes.

The core building blocks are:

- `global.text_channel_catalog_v1.json` — definitions and rules for text channels;
- `ds.ui_text_bundle_core_v1.schema.json` — a structured container for UI text with channels.

---

## 2. Text channels

### 2.1. Catalog

Text channels are defined in:

- `global.text_channel_catalog_v1.json`

This catalog defines at least the following channels:

1. **`human_ui`**

   - Text that is **shown directly to human users** in interfaces.
   - Examples:
     - questions and prompts in forms;
     - explanations and hints;
     - error and success messages;
     - section titles and labels.

2. **`model_instruction`**

   - Text intended only for **AI models as instructions or guidance**.
   - Not shown to end users.
   - Examples:
     - system-level instructions associated with a UI element;
     - hints for how a model should interpret user input;
     - notes for an AI assistant about context or constraints.

3. **`system_log`**

   - Text intended for **logging and diagnostics**.
   - Not used as prompts and not shown as user-facing content.
   - Examples:
     - debug messages;
     - warnings and error traces;
     - internal annotations for operators.

4. **`mixed_legacy`**

   - Legacy channel where human text and model instructions are not clearly separated.
   - Marked as **deprecated**.
   - Intended only for migration of existing systems, not for new designs.

### 2.2. Rules

The catalog also defines rules about how these channels can be used. Key rules include:

1. **No model instructions in schema metadata**

   - Rule: `no_llm_instructions_in_meta_ext`
   - Meaning:
     - fields `meta` and `ext` in `ds.*` schemas must not contain direct execution instructions for AI models;
     - they may contain human-readable descriptions, labels, and technical hints.

2. **Human UI text must be clean**

   - Human-facing text (`human_ui`) must not:
     - contain hidden instructions for models;
     - be repurposed as prompts.

   Any text intended for models must be stored separately in `model_instruction` channels.

3. **Model instruction text must not be shown to users**

   - `model_instruction` text must:
     - be used only by executors and AI models;
     - not be displayed in the user interface.

4. **System logs are not prompts**

   - `system_log` text must not be used as prompts or instructions;
   - logs can refer to events, errors and internal state, but remain technical.

These rules are enforced conceptually by the specification and are expected to be enforced practically by tools and executors.

---

## 3. UI text bundles

### 3.1. Core schema

UI text is structured using:

- `ds.ui_text_bundle_core_v1.schema.json`

Each bundle represents all text relevant to a specific UI context, such as:

- a question in a form,
- a section or group of fields,
- an error or success message,
- a help panel or explanation block.

The core fields include:

- `bundle_id`  
  Identifier of the text bundle (for example `personal_profile.address.street_number.info`).

- `context_id` (optional)  
  Identifier of the context in which this text is used:
  - envelope id,
  - form id,
  - scenario id,
  - step id.

- `role`  
  Logical role of the UI text, for example:
  - `question`
  - `explanation`
  - `hint`
  - `error_message`
  - `success_message`
  - `section_title`
  - `other`

- `human_text`  
  A structured object with at least:
  - `channel` — must be `"human_ui"`;
  - `text` — text shown to the user.

- `model_text` (optional)  
  A structured object with:
  - `channel` — must be `"model_instruction"`;
  - `text` — instruction or guidance for the model related to this UI element.

- optional extension fields for:
  - localisation (language tags, translation references);
  - formatting hints;
  - accessibility notes.

### 3.2. Separation of concerns

The design of `ds.ui_text_bundle_core_v1` enforces a clear separation:

- **What the user sees** (`human_text`) is clean, human-readable content.
- **What the model sees** (`model_text`) is explicit instruction text.

This makes it possible to:

- audit and revise user-facing content independently from model instructions;
- localise UI text without touching model instructions;
- adjust model behaviour without accidentally changing what users see.

### 3.3. Example (informal)

An informal example of how a bundle might look (not a full schema definition):

```json
{
  "bundle_id": "social.personal_profile.birth_date.question",
  "context_id": "ds.personal_profile_v1_de",
  "role": "question",
  "human_text": {
    "channel": "human_ui",
    "text": "Please enter your date of birth as it appears in your official documents."
  },
  "model_text": {
    "channel": "model_instruction",
    "text": "Ask the user for their date of birth in a calm, clear tone. Do not explain legal details here; focus only on the format and importance of accuracy."
  }
}
In this example:

the human sees only the human_text.text;

the model receives additional guidance from model_text.text.

4. Relation to schemas and envelopes
4.1. Data schemas (ds.*)
Data schemas describe structure and validation, not human copy.

For example:

ds.personal_profile_v1_de defines fields like first_name, birth_date, address, etc.;

it may contain meta descriptions and labels, but not instructions for models.

UI text bundles complement schemas by:

providing concrete text to be shown for each field, section or step;

capturing model-specific instructions for how to present or process those fields.

This separation supports:

multiple UI variants for the same schema;

user-specific or product-specific flows without changing core data definitions.

4.2. Envelopes (env.*)
Envelopes describe speech-acts over data (requests, commands, events).
They can refer to UI text bundles in several ways:

by context ids (context_id in bundles referencing envelope types or step ids);

by links in executor or scenario configuration.

However, envelopes themselves:

should not contain large amounts of UI text;

should only carry references and minimal labels when necessary.

The main storage for human-facing text and model instructions should be ds.ui_text_bundle_core_v1 instances or schemas that extend it.

5. UX and conversational flows
5.1. One question — one bundle
In conversational or step-by-step UX flows:

each question or interaction step should have its own UI text bundle;

the system should track:

which bundle was used;

when it was shown;

how the user responded.

This enables:

clear measurement of friction at each step;

analysis of which questions or explanations cause drop-offs;

evolution of UI text and model instructions based on real episodes.

5.2. Linking UI text to episodes
Episodes can reference:

which bundle_id was used;

which context_id applied;

what the user did next.

For example:

an episode for filling a form section could reference:

the set of bundles shown;

whether the user completed or abandoned the section.

By aggregating these episodes, the system can:

identify confusing questions;

improve explanations or hints;

adjust the order of steps.

5.3. Explaining why a question is asked
A MOVA-based UX can explicitly separate:

the question itself (role = "question");

the explanation of why the question matters (role = "explanation").

Both can be represented as different bundles referencing the same context.
This allows:

richer guidance to the user;

better alignment between legal or organisational requirements and UX.

6. Localisation and variants
6.1. Localisation strategy
MOVA 4.1.0 does not prescribe a single localisation strategy, but ds.ui_text_bundle_core_v1 is designed to support:

multiple languages;

regional variants;

A/B-tested variants.

Possible strategies include:

separate bundles per language (language encoded in bundle_id or stored in fields);

language tags inside the bundle (lang field);

dedicated localisation catalogs.

The key requirement is:

human-facing text remains in human_text;

model instructions remain in model_text.

6.2. Variants and experiments
For experiments and A/B tests:

multiple bundles may share the same context_id but have different bundle_id values;

executors or UX layers can choose which bundle to show based on configuration.

Episodes can then record:

which bundle variant was used;

how users reacted.

This makes it possible to:

optimise UI and text empirically;

keep experiments fully transparent in data.

7. Responsibilities of tools and executors
Tools and executors that work with UI text in MOVA-based systems should:

Enforce channel separation

ensure that:

human_text.channel = "human_ui";

model_text.channel = "model_instruction";

prevent direct use of human_text as prompts.

Respect global rules

follow rules from global.text_channel_catalog_v1.json, especially:

no instructions in meta/ext for ds.*;

human_ui is never used as a model_instruction channel;

model_instruction text is not shown to end users.

Support bundles

load, validate and use ds.ui_text_bundle_core_v1 documents;

provide APIs for:

selecting bundles by context_id, role and language;

rendering human_text in UI;

sending model_text to AI models.

Integrate with episodes

record which bundles were used in episodes, where relevant;

enable analysis of UX performance based on bundle usage.

8. Checklist for text and UI design in MOVA 4.1.0
When designing text and UI for a MOVA-based system:

Use text channels

assign each piece of text to the appropriate channel:

human_ui, model_instruction, system_log;

avoid mixed_legacy for new designs.

Create UI text bundles

use ds.ui_text_bundle_core_v1 to group:

questions,

explanations,

hints,

messages.

Keep instructions separate

store model-specific instructions in model_text;

keep user-facing content in human_text.

Link to schemas and episodes

use context_id and bundle_id to:

connect UI text to data schemas;

connect UI flows to episodes.

Support evolution

design for localisation and variants;

plan to analyse episodes to improve UI and text.

By following these principles, MOVA-based systems can:

remain safe against accidental prompt injection through UI;

provide consistent, explainable interfaces;

evolve their UX based on real usage data, without compromising the constitutional core.