# MOVA 4.1.1 – Release Notes (Patch over 4.1.0)

## Scope and compatibility

- 4.1.1 is a **patch release** on top of 4.1.0.  
- **No breaking changes** to JSON structures (`ds.*`, `env.*`, `global.*`).  
- Updates focus on:
  - clarified spec texts;
  - aligning schemas with global catalogs;
  - fixing mandatory layers (security, text/UI, layers/namespaces);
  - introducing the operator frame.

## Summary of changes

**A. Red core & catalogs**
- Core catalog cleaned of domain schemas (Smartlink → skills).
- `ds.mova4_core_catalog_v1` and `env.mova4_core_catalog_publish_v1` updated to 4.1.1 and aligned with red-core inventory.
- Global catalogs (layers, text_channels, episode_type, security) marked as mandatory for the core.

**B. Security layer**
- Security-layer spec updated to 4.1.1 and declared mandatory red-core layer.
- `ds.security_event_episode_core_v1` and `ds.instruction_profile_core_v1` now explicitly reference `global.security_catalog_v1` for `security_event_type`, `policy_profile_id`, `action_type`, `security_model_version`.
- `env.instruction_profile_publish_v1.example.json` and `env.security_event_store_v1.example.json` aligned and stripped of domain specifics.

**C. Text & UI layer**
- `mova_4.1.1_text_and_ui_layer` clarifies channel separation (`human_ui`, `model_instruction`, `system_log`, `mixed_legacy`).
- `ds.ui_text_bundle_core_v1` aligned with `global.text_channel_catalog_v1`; reinforces no model instructions in human-facing fields.

**D. Layers & namespaces**
- Red_core formally “clean”: only language contracts (`ds/env/global`, no domain).
- Smartlink, social, e-commerce and other domains tagged as **skills layer**.
- Infra-layer fixed as execution plane (Cloudflare, VS Code, sandbox) without changing the language.

**E. Operator frame**
- Added `mova_4.1.1_operator_frame.md` with 12-axis frame (what/how/where/when/why/...).
- Constitution, episodes, and security-layer docs link to the operator frame as the official audit lens.

## Migration notes (4.1.0 → 4.1.1)

- If you already comply with 4.1.0, **no schema changes** are required.  
- Recommended:
  - update documentation to 4.1.1;
  - verify the core catalog is domain-free;
  - ensure security episodes and instruction profiles align with `global.security_catalog_v1`;
  - ensure text/UI channels do not mix human-facing text with model instructions.

## Files touched in 4.1.1

- Spec docs: constitution, core, global & verbs, runtime & connectors, security layer, text/UI layer, layers & namespaces, operator frame, episodes/genetic layer.
- Schemas: `ds.mova4_core_catalog_v1`, `env.mova4_core_catalog_publish_v1`, `ds.security_event_episode_core_v1`, `ds.instruction_profile_core_v1`, `ds.ui_text_bundle_core_v1`.
- Catalogs: `global.layers_and_namespaces_v1`, `global.security_catalog_v1`, `global.text_channel_catalog_v1`, `global.episode_type_catalog_v1`.
- Examples: `mova4_core_catalog.example.json`, `env.mova4_core_catalog_publish_v1.example.json`, `env.instruction_profile_publish_v1.example.json`, `env.security_event_store_v1.example.json` (mova_version bumped to 4.1.1; core catalog version set to `4.1.1-core` with provenance note).
- Core spec files renamed to `mova_4.1.1_*.md` to reflect the 4.1.1 patch release.
