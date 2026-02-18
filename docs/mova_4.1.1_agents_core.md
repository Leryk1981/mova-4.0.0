# MOVA 5.0.0 Agents Core

## Purpose

This document defines the core MOVA contracts to describe an agent as a verifiable, portable, and policy-bound entity.

It introduces:

- `ds.mova_agent_contract_core_v1`
- `ds.mova_agent_execution_result_core_v1`
- `env.mova_agent_profile_publish_v1`
- `env.mova_agent_task_execute_v1`
- `env.mova_agent_result_publish_v1`

These contracts are runtime-agnostic and can be used for workflow orchestration, registries, and arena-style evaluation.

## Core model

### 1) Agent contract (`ds.mova_agent_contract_core_v1`)

Describes what an agent is allowed and expected to do:

- identity/version (`agent_id`, `agent_version`)
- ownership and lifecycle (`owner`, `status`)
- domains/capabilities (`task_domains`, `capability_tags`)
- interfaces (`input_envelope_ids`, `output_envelope_ids`)
- runtime/connectors (`runtime_binding_ref`, `connector_refs`)
- governance (`policy_profile_ref`)
- observability obligations (`observability_profile`)
- determinism controls (`determinism_controls`)
- operational limits (`limits`)

### 2) Agent execution result (`ds.mova_agent_execution_result_core_v1`)

Describes a completed run in a vendor-neutral shape:

- run identity (`result_id`, `run_id`, `task_id`, `agent_id`)
- status and timing (`status`, `started_at`, `finished_at`)
- artifacts (`output_refs`, `observability_refs`)
- metrics (`token_usage_total`, `duration_ms_total`, `tool_calls_total`)

## Envelope flow

### `env.mova_agent_profile_publish_v1`

Publishes or updates agent profile in a registry/catalog.

### `env.mova_agent_task_execute_v1`

Requests a concrete task execution under explicit policy/profile references and determinism options.

### `env.mova_agent_result_publish_v1`

Publishes final execution result to requester/referee/registry.

## Why this closes the loop

With these contracts, the ecosystem can:

1. Describe an agent profile formally.
2. Execute tasks via standardized envelope.
3. Publish deterministic result + observability references.
4. Feed arena profile/referee and certification flows without ad-hoc glue.
