# MOVA 4.1.1 – Core Spec Update Plan

MOVA 4.1.1 — це патч-оновлення поверх 4.1.0 без ломаючих змін у JSON-структурах. Ціль — закрити прогалини аудиту 4.1.0 (ядро, безпека, текстові канали, глобальні словники, шари/неймспейси).

## Goals

- завершити core-catalog і глобальні словники;
- підняти security-layer до статусу обов’язкової частини ядра;
- довести text/UI-layer до чітко описаної норми;
- зафіксувати правила шарів і просторів імен (red_core / skills / infra);
- ввести operator-frame як аналітичну рамку для 4.1.x.

## Checklist

### A. Red core & catalogs
- [ ] A1: Clean up core catalog (remove domain schemas, include all red-core ds/env/global).
- [x] A2: Sync mova4 core catalog schema with actual red-core artifacts.
- [x] A3: Finalize required global catalogs (episode types, layers/namespaces, text channels, security).

### B. Security layer
- [x] B1: Align instruction_profile, security_event schemas and security catalog.
- [x] B2: Update examples for instruction profiles and security events.
- [x] B3: Update security-layer documentation for 4.1.1.

### C. Text & UI layer
- [ ] C1: Sync text_channel catalog with ui_text_bundle schema.
- [x] C2: Update text/UI layer doc (human vs model vs log text rules).

### D. Layers & namespaces
- [x] D1: Update layers/namespaces rules (red_core / skills / infra).
- [x] D2: Move Smartlink and other domain schemas out of the red core docs into skills-level examples.

### E. Operator frame
- [x] E1: Add operator-frame doc (what/how/where/when/why/...).
- [x] E2: Cross-link operator-frame from constitution, episodes, security docs.

### F. Release notes
- [x] F1: Update version mentions from 4.1.0 to 4.1.1 in spec texts (where appropriate).
- [x] F2: Create MOVA_4.1.1_RELEASE_NOTES.md (added/clarified/extracted items).

## Status / Progress

- Security layer: core doc updated to 4.1.1; catalog and examples alignment tracked under B1/B2.
- Text/UI layer: doc updated to 4.1.1, headings bumped; channel separation clarified.
- Layers/namespaces: rules refreshed for 4.1.1; Smartlink and other domains scoped to skills layer.
- Core catalog and security schemas now explicitly aligned with global.security_catalog_v1 and the red-core inventory (examples included in this slice).
- Operator frame: formalised as a 4.1.1 doc; constitution, episodes, and security docs now reference it as the auditing lens.
- Release notes created; core/global/runtime docs marked as 4.1.1 with applicability notes.
- Version sweep completed: filenames now `mova_4.1.1_*`, examples use `mova_version = 4.1.1`, core catalog version `4.1.1-core`.

## Current Red Core Inventory (4.1.0 snapshot)

The table below summarizes current ds/env/global artifacts that are candidates for the red core in MOVA 4.1.0.
It will be used as a baseline for the 4.1.1 cleanup and catalog alignment.

| id                                        | kind   | file path                                      | layer_guess      | notes |
|-------------------------------------------|--------|------------------------------------------------|------------------|-------|
| ds.mova_schema_core_v1                    | ds     | mova-spec-4.0.0/schemas/ds.mova_schema_core_v1.schema.json     | red_core         | base form for all MOVA records |
| ds.mova_episode_core_v1                   | ds     | mova-spec-4.0.0/schemas/ds.mova_episode_core_v1.schema.json    | red_core         | base form for episodes          |
| ds.security_event_episode_core_v1         | ds     | mova-spec-4.0.0/schemas/ds.security_event_episode_core_v1.schema.json | red_core         | security event episodes         |
| ds.instruction_profile_core_v1            | ds     | mova-spec-4.0.0/schemas/ds.instruction_profile_core_v1.schema.json | red_core         | instruction and guardrail profiles |
| ds.runtime_binding_core_v1               | ds     | mova-spec-4.0.0/schemas/ds.runtime_binding_core_v1.schema.json | red_core         | runtime binding descriptions   |
| ds.connector_core_v1                      | ds     | mova-spec-4.0.0/schemas/ds.connector_core_v1.schema.json | red_core         | connector descriptions         |
| ds.ui_text_bundle_core_v1                 | ds     | mova-spec-4.0.0/schemas/ds.ui_text_bundle_core_v1.schema.json | red_core         | UI text bundles                |
| ds.mova4_core_catalog_v1                  | ds     | mova-spec-4.0.0/schemas/ds.mova4_core_catalog_v1.schema.json | red_core         | core catalog schema            |
| env.mova4_core_catalog_publish_v1          | env    | mova-spec-4.0.0/schemas/env.mova4_core_catalog_publish_v1.schema.json | red_core         | core catalog publish envelope  |
| env.instruction_profile_publish_v1        | env    | mova-spec-4.0.0/schemas/env.instruction_profile_publish_v1.schema.json | red_core         | instruction profile publish envelope |
| env.security_event_store_v1               | env    | mova-spec-4.0.0/schemas/env.security_event_store_v1.schema.json | red_core         | security event store envelope  |
| global.layers_and_namespaces_v1           | global | mova-spec-4.0.0/global.layers_and_namespaces_v1.json | red_core         | layers and namespaces rules    |
| global.security_catalog_v1                | global | mova-spec-4.0.0/global.security_catalog_v1.json | red_core         | security event types and actions |
| global.text_channel_catalog_v1            | global | mova-spec-4.0.0/global.text_channel_catalog_v1.json | red_core         | text channel definitions       |
| global.episode_type_catalog_v1            | global | mova-spec-4.0.0/global.episode_type_catalog_v1.json | red_core         | episode type definitions       |

## References

mova_4.1.1_constitution_en.md
mova_4.1.1_core.md
mova_4.1.1_security_layer.md
mova_4.1.1_text_and_ui_layer.md
mova_4.1.1_layers_and_namespaces.md
global.*
ds.*, env.*
