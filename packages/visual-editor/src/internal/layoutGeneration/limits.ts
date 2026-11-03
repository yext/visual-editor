/** Maximum duration of one model attempt before it is aborted. */
export const GENERATION_ATTEMPT_DEADLINE_MS = 5 * 60 * 1000; // 5 minutes
/** Maximum output tokens for generating a complete page. */
export const FRESH_PAGE_OUTPUT_TOKEN_BUDGET = 128_000;
/** Retry allowance when the gateway rejects regeneration before using any tokens. */
export const REGENERATION_FALLBACK_OUTPUT_TOKEN_BUDGET = 64_000;
/** Maximum output tokens for resolving translation choices and requested card counts. */
export const GENERATION_PREPARATION_OUTPUT_TOKEN_BUDGET = 2_048;
/** Maximum output tokens for planning changes to an existing page. */
export const EDIT_PLANNING_OUTPUT_TOKEN_BUDGET = 16_384;
/** Maximum output tokens for generating changes to one planned section. */
export const SECTION_EDIT_OUTPUT_TOKEN_BUDGET = 32_768;

/** Maximum validation-feedback length included in a repair request. */
export const GENERATION_REPAIR_FEEDBACK_MAX_CHARACTERS = 4_000;
/** Maximum number of independent section tasks allowed to run at once. */
export const SECTION_TASK_CONCURRENCY = 2;
/** Wait before generation so Puck can record pending manual edits in its history. */
export const PUCK_HISTORY_SETTLE_DELAY_MS = 260;
/** Maximum error-message length included in browser error reports. */
export const GENERATION_ERROR_MAX_CHARACTERS = 32_768;
/** Maximum stack-trace length included in browser error reports. */
export const GENERATION_STACK_MAX_CHARACTERS = 65_536;
/** Omit serialized candidates larger than this from browser error reports. */
export const GENERATION_CANDIDATE_MAX_CHARACTERS = 500_000;
/** Omit serialized canvas snapshots larger than this from diagnostic reports. */
export const GENERATION_SNAPSHOT_MAX_BYTES = 2_000_000;
/** Maximum number of changed property paths recorded in a canvas diagnostic. */
export const GENERATION_CHANGED_PATHS_LIMIT = 100;
/** Maximum phase-label length included in local diagnostic reports. */
export const GENERATION_PHASE_MAX_CHARACTERS = 100;
/** Maximum JSON request-body size accepted by the local model proxy. */
export const GENERATION_MODEL_REQUEST_MAX_BYTES = 16 * 1024 * 1024;
/** Maximum JSON request-body size accepted by local diagnostic and error endpoints. */
export const GENERATION_REPORT_MAX_BYTES = 4 * 1024 * 1024;
/** Maximum upstream error-response length written to local generation logs. */
export const GENERATION_UPSTREAM_ERROR_MAX_CHARACTERS = 8_192;

/** Interval for flushing buffered local generation logs to disk. */
export const GENERATION_LOG_FLUSH_INTERVAL_MS = 10_000;
/** Flush local generation logs early when the buffered data reaches this size. */
export const GENERATION_LOG_BUFFER_MAX_BYTES = 4 * 1024 * 1024;
