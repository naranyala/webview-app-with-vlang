# Bridge API

## Response Envelope

Every V binding returns a JSON-encoded response:

```json
{ "ok": true, "data": "value" }
```

Failures use:

```json
{ "ok": false, "error": "Human-readable message" }
```

`data` is a string in the V envelope. Quiz methods put a second JSON document
inside that string; `frontend-preact/src/backend.js` parses it through
`parseQuizPayload`.

The frontend rejects malformed payloads and turns failures into `BackendError`.
Native calls time out after 8 seconds. In browser development, missing bindings
use mock behavior unless `window.__PREACT_MOCK_BRIDGE__` is explicitly `false`.

## Core Bindings

| Binding | Argument | Successful data |
| --- | --- | --- |
| `greet_from_v` | Message string, required, maximum 1000 characters | Timestamped greeting string |
| `get_time` | None | Formatted V timestamp |
| `get_system_info` | None | System name, such as `Linux` |
| `get_status` | None | Backend status string |
| `increment` | Integer delta from `-1000000` to `1000000` | Current counter as a string |
| `reset` | None | `0` as a string |
| `minimize_window` | None | Operation status |
| `maximize_window` | None | Operation status |
| `restore_window` | None | Operation status |
| `close_window` | None | Operation status |

Window controls are implemented on Linux. Other platforms return an explicit
unsupported-operation error.

## Quiz Bindings

Quiz payloads are JSON strings passed as the first argument. Fields are checked
by `QuizStore` before mutation.

| Binding | Argument | Successful data |
| --- | --- | --- |
| `quiz_list` | None | JSON array of collections |
| `quiz_create_collection` | Collection JSON | Created collection JSON |
| `quiz_update_collection` | Collection JSON with existing `id` | Updated collection JSON |
| `quiz_delete_collection` | Collection ID | Status string |
| `quiz_create_question` | Question JSON with `collection_id` | Updated collection JSON |
| `quiz_update_question` | Question JSON with `collection_id` and `id` | Updated collection JSON |
| `quiz_delete_question` | Question JSON with `collection_id` and `id` | Updated collection JSON |

Collection fields are `id`, `title`, `description`, `tone`, `level`, and
`questions`. Question fields are `id`, `topic`, `question`, and `answer`.
Collections are limited to 1,000 items, questions to 500 per collection, and
question/answer text to 20,000 characters.

## Studio Bindings

| Binding | Argument | Successful data |
| --- | --- | --- |
| `list_volumes` | None | JSON array of Blender/sample/render volumes |
| `start_asset_scan` | Root path | Queued scan-job JSON |
| `get_asset_scan_status` | Job ID | Scan-job JSON |
| `cancel_asset_scan` | Job ID | Status string |
| `get_audio_metadata` | Audio path | Format, duration, rate, channels JSON |
| `analyze_audio` | Audio path | Tempo, key, loudness, chroma, MFCC JSON |
| `mir_analyze` | JSON `{ samples, sample_rate }` | Time-domain features JSON (`rms`, `peak`, `zcr`, counts) |

Audio paths are limited to `.wav`, `.flac`, `.mp3`, `.ogg`, `.mid`, and
`.midi`. Native analysis currently returns a validated placeholder feature
document with the same shape the real DSP pipeline will produce.

## Frontend Client

Use the exported `backend` object rather than calling `window.*` directly:

```js
const status = await backend.getStatus();
const collections = await backend.quizList();
```

The current bindings are attached directly to `window`. A namespaced,
versioned RPC surface is planned but has not been introduced yet.
