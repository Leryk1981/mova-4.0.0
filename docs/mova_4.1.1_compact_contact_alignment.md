# MOVA 4.1.1 Compact/Contact Alignment (Observability Addendum)

## Purpose

This addendum aligns MOVA Spec with recent practical contracts used in:

- `MOVA Compact` step capture
- `MOVA Contact` execute step log
- vendor-neutral arena comparison flow

The alignment is additive and does not replace existing `ds.mova_episode_core_v1`.

## Added schemas

- `ds.mova_contact_step_core_v1`
- `ds.mova_compact_capture_step_core_v1`
- `ds.mova_observability_step_core_v1`

## Field mapping (core)

| Meaning | Contact step | Compact capture | Unified arena |
|---|---|---|---|
| Run id | `run_id` | `run_id` | `run_id` |
| Step id | `step_id` (int) | `step_id` (int) | `step_id` (`S000001`) |
| Time | `ts_start_utc` + `duration_ms` | `ts_ms` + `dur_ms` | `ts_ms` + `dur_ms` |
| Actor | `actor_id` | `actor_id` | `actor_id` |
| Action | `verb` + `object` + `tool` | `action_code` + `subject_ref` + `tool_code` | `verb_id` + `object_id` + `tool_id` |
| Result | `result` | `result_code` | `result_code` |
| Failure reason | `reason_code` | `reason_code` (optional) | `reason_code` |
| Loop signal | `loop_signature_detected` | `loop_signature_detected` (optional) | `loop_signature_detected` |
| OTel correlation | `correlation` (optional) | `correlation` | `correlation` |

## Reason/result code contract

Unified `reason_code`:

- `none`
- `missing_input`
- `permission`
- `network`
- `tool_error`
- `format_error`
- `no_progress`
- `unsafe_side_effect`

Unified `result_code`:

- `ok`
- `warn`
- `retry`
- `timeout`
- `denied`
- `fail`
- `block`

## Compatibility note

`ds.mova_observability_step_core_v1` is the recommended canonical shape for arena referee comparison.
Source-specific records should be normalized to it before cross-vendor evaluation.
