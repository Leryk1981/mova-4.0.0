# MOVA 5.0.0 — Release Notes

## Summary

MOVA 5.0.0 is a major version update that formalizes agent contracts as first-class core artifacts.

This release adds:

- `ds.mova_agent_contract_core_v1`
- `ds.mova_agent_execution_result_core_v1`
- `env.mova_agent_profile_publish_v1`
- `env.mova_agent_task_execute_v1`
- `env.mova_agent_result_publish_v1`
- `docs/mova_4.1.1_agents_core.md` (agent lifecycle specification text)

## Why major version bump

The language scope now explicitly includes standard contract forms for:

1. agent identity/profile publication,
2. deterministic task execution requests,
3. standardized result publication with observability references.

This closes a previously externalized part of the lifecycle and is treated as a major milestone.

## Compatibility notes

- Existing `_core_v1` schema ids are preserved.
- Historical document filenames with `mova_4.1.1_*` are retained for path stability.
- `MOVA 5.0.0` is the canonical product/version label going forward.
