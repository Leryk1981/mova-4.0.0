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
- [ ] A2: Sync mova4 core catalog schema with actual red-core artifacts.
- [ ] A3: Finalize required global catalogs (episode types, layers/namespaces, text channels, security).

### B. Security layer
- [ ] B1: Align instruction_profile, security_event schemas and security catalog.
- [ ] B2: Update examples for instruction profiles and security events.
- [x] B3: Update security-layer documentation for 4.1.1.

### C. Text & UI layer
- [ ] C1: Sync text_channel catalog with ui_text_bundle schema.
- [ ] C2: Update text/UI layer doc (human vs model vs log text rules).

### D. Layers & namespaces
- [ ] D1: Update layers/namespaces rules (red_core / skills / infra).
- [ ] D2: Move Smartlink and other domain schemas out of the red core docs into skills-level examples.

### E. Operator frame
- [ ] E1: Add operator-frame doc (what/how/where/when/why/...).
- [ ] E2: Cross-link operator-frame from constitution, episodes, security docs.

### F. Release notes
- [ ] F1: Update version mentions from 4.1.0 to 4.1.1 in spec texts (where appropriate).
- [ ] F2: Create MOVA_4.1.1_RELEASE_NOTES.md (added/clarified/extracted items).

## Status / Progress

- Security layer: core doc updated to 4.1.1; catalog and examples alignment tracked under B1/B2.

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

mova_4.1.0_constitution_en.md
mova_4.1.0_core.md
mova_4.1.0_security_layer.md
mova_4.1.0_text_and_ui_layer.md
mova_4.1.0_layers_and_namespaces.md
global.*
ds.*, env.*
