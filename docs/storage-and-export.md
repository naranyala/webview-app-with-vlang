# Storage and Export

## Quiz

The native Quiz store is initialized during application startup. It creates:

```text
<os.config_dir()>/webview-app/quizzes.json
```

On Linux this is normally `~/.config/webview-app/quizzes.json`. The JSON
document contains `version: 1` and a list of collections. Writes use
`quizzes.json.tmp` followed by rename, and a mutex protects in-process access.
Invalid data, unsupported versions, oversized collections, and empty required
fields are rejected. There is currently no migration path for a future schema
version.

## Browser-Local Tools

These tools currently use `localStorage` rather than the V store:

| Tool | Storage key | Data |
| --- | --- | --- |
| Chain Notes | `webview-app.chain-notes` | Note title, tag, question, answer, and update marker |
| Todos | `preact-todomvc.todos` | Todo text and completion state |
| Academic Paper | `webview-app.academic-papers` | Paper metadata, typed sections, references, and image assets |

Academic Papers are normalized before use. A paper contains metadata, authors,
abstract, keywords, ordered sections, typed blocks, references, and assets.
Image assets are stored as data URLs with `name`, `type`, `src`, `alt`, and
`caption`. Browser storage quotas therefore limit the practical size of an
image library.

There is no cloud sync, conflict resolution, or automatic backup. Browser data
and the native Quiz file are separate stores.

## Search

Chain Notes builds a cached `fast-fuzzy` searcher over note titles, tags,
questions, and answers. The comparison benchmark generates 2,000 notes and
compares exact matching, Fuse.js, fuzzysort, and fast-fuzzy:

```sh
npm run bench:notes-search --prefix frontend-preact
```

## PDF and Print

Chain Notes and Academic Paper each have two browser actions:

- `Print / Save PDF` creates a print-only document and opens the WebView/OS
  print dialog. This is the recommended path for selectable text and a user-
  chosen system save location.
- `Download PDF` uses `html2pdf.js` and saves directly from the browser.

The Academic Paper document builder renders the title, abstract, typed blocks,
references, and two-column layout from the same normalized model used on
screen. Image assets are managed locally but are not currently embedded in the
Academic Paper PDF output.

The Node-compatible PDF benchmark compares jsPDF text output with
`html-to-pdfmake` plus `pdfmake`:

```sh
npm run bench:notes-pdf --prefix frontend-preact
```
