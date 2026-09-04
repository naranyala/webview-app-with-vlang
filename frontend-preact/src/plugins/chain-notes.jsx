import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { backend, backendError } from '../backend.js';
import {
  benchmarkNotePdf,
  exportHtmlNoteAsPdf,
  generateNotePdfBytes,
  notePdfFileName,
  pdfBytesToBase64,
  printNoteInSystemDialog
} from '../note-pdf.mjs';
import { createNoteSearcher } from '../notes-search.mjs';
import { parseExternalChat, serializeQna } from '../qna.mjs';
import { parseChainNoteRecords } from '../schemas.mjs';
import {
  loadChainNotesFromStorage,
  saveChainNotesToStorage
} from '../storage.mjs';
import { styles, stylex } from '../stylex.js';

const STORAGE_KEY = 'webview-app.chain-notes';

const starterNotes = [
  {
    id: 'north-star',
    title: 'Toolkit north star',
    tag: 'Planning',
    updated: 'Today',
    question: 'What should guide the toolkit?',
    answer:
      'Build a collection of small tools that feel calm, fast, and useful.\n\nStart with the local desktop experience, then connect each tool to a focused backend service.'
  },
  {
    id: 'scanner-flow',
    title: 'Scanner flow',
    tag: 'Product',
    updated: 'Yesterday',
    question: 'What should the disk scanner flow look like?',
    answer:
      '1. Pick a volume.\n2. Start a cancellable scan.\n3. Stream progress without blocking the window.\n4. Surface the largest folders first.'
  },
  {
    id: 'audio-ideas',
    title: 'Audio ideas',
    tag: 'Research',
    updated: 'Aug 28',
    question: 'What is the right scope for the first equalizer?',
    answer:
      'Keep the first equalizer app-local. A system-wide audio route needs a separate platform and driver plan.'
  }
];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadNotes() {
  if (typeof window === 'undefined') return starterNotes;

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(stored)) return starterNotes;

    return parseChainNoteRecords(stored);
  } catch {
    return starterNotes;
  }
}

function chainLabel(id, notes) {
  const index = notes.findIndex((note) => note.id === id);
  return index === -1 ? '--' : String(index + 1).padStart(2, '0');
}

export function ChainNotes() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeNoteId, setActiveNoteId] = useState(() => notes[0]?.id ?? null);
  const [noteQuery, setNoteQuery] = useState('');
  const [noteTitle, setNoteTitle] = useState(() => notes[0]?.title ?? '');
  const [noteQuestion, setNoteQuestion] = useState(
    () => notes[0]?.question ?? ''
  );
  const [noteAnswer, setNoteAnswer] = useState(() => notes[0]?.answer ?? '');
  const [importText, setImportText] = useState('');
  const [storageError, setStorageError] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkStatus, setBenchmarkStatus] = useState('');
  const saveTimer = useRef(null);
  const nativeNotes = backend.hasNativeBinding('get_notes');

  const noteSearcher = useMemo(() => createNoteSearcher(notes), [notes]);
  const filteredNotes = useMemo(
    () => noteSearcher.search(noteQuery),
    [noteSearcher, noteQuery]
  );
  const noteWordCount = `${noteQuestion} ${noteAnswer}`.trim()
    ? `${noteQuestion} ${noteAnswer}`.trim().split(/\s+/).length
    : 0;

  useEffect(() => {
    let active = true;
    const load = nativeNotes ? backend.getNotes() : loadChainNotesFromStorage();
    load
      .then((stored) => {
        if (!active) return;
        if (stored !== null && Array.isArray(stored)) {
          setNotes(stored);
          const firstNote = stored[0];
          if (firstNote) {
            setActiveNoteId(firstNote.id);
            setNoteTitle(firstNote.title);
            setNoteQuestion(firstNote.question);
            setNoteAnswer(firstNote.answer);
          } else {
            setActiveNoteId(null);
            setNoteTitle('');
            setNoteQuestion('');
            setNoteAnswer('');
          }
        }
        setStorageReady(true);
      })
      .catch((error) => {
        if (!active) return;
        setStorageError(backendError(error));
        setStorageReady(true);
      });
    return () => {
      active = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [nativeNotes]);

  useEffect(() => {
    if (!storageReady || nativeNotes) return;
    let active = true;
    saveChainNotesToStorage(notes).then((saved) => {
      if (!active) return;
      setStorageError(
        saved ? '' : 'Local changes could not be saved in this browser.'
      );
    });
    return () => {
      active = false;
    };
  }, [notes, storageReady]);

  function selectNote(note) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setActiveNoteId(note.id);
    setNoteTitle(note.title);
    setNoteQuestion(note.question);
    setNoteAnswer(note.answer);
  }

  function updateNote(title, question, answer) {
    const body = serializeQna(question, answer);
    setNotes((current) =>
      current.map((item) =>
        item.id === activeNoteId
          ? {
              ...item,
              title: title || 'Untitled note',
              question,
              answer,
              updated: 'Just now'
            }
          : item
      )
    );
    if (nativeNotes && activeNoteId) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const noteId = activeNoteId;
      const tag = notes.find((item) => item.id === noteId)?.tag || 'Draft';
      saveTimer.current = setTimeout(() => {
        backend
          .updateNote(noteId, title || 'Untitled note', tag, body)
          .then((savedNote) => {
            setNotes((current) =>
              current.map((item) =>
                item.id === savedNote.id ? savedNote : item
              )
            );
          })
          .catch((error) => setStorageError(backendError(error)));
      }, 350);
    }
  }

  async function createNote() {
    const note = {
      id: createId(),
      title: 'Untitled Q&A',
      tag: 'Draft',
      updated: 'Just now',
      question: '',
      answer: ''
    };
    try {
      const created = nativeNotes
        ? await backend.createNote(note.title, note.tag, serializeQna('', ''))
        : note;
      setNotes((current) => [...current, created]);
      selectNote(created);
    } catch (error) {
      setStorageError(backendError(error));
    }
  }

  async function deleteNote() {
    if (!activeNoteId) return;

    try {
      if (nativeNotes) await backend.deleteNote(activeNoteId);
    } catch (error) {
      setStorageError(backendError(error));
      return;
    }

    const currentIndex = notes.findIndex((note) => note.id === activeNoteId);
    const remaining = notes.filter((note) => note.id !== activeNoteId);
    setNotes(remaining);
    const nextNote = remaining[currentIndex] || remaining[currentIndex - 1];
    if (nextNote) {
      selectNote(nextNote);
    } else {
      setActiveNoteId(null);
      setNoteTitle('');
      setNoteQuestion('');
      setNoteAnswer('');
    }
  }

  function importChat() {
    const qna = parseExternalChat(importText);
    if (!qna) {
      setStorageError('Paste a question and answer before importing.');
      return;
    }
    setStorageError('');
    setNoteQuestion(qna.question);
    setNoteAnswer(qna.answer);
    updateNote(noteTitle, qna.question, qna.answer);
    setImportText('');
  }

  async function exportNoteAsPdf() {
    if (exporting || benchmarking) return;
    setExporting(true);
    setExportError('');
    try {
      const note = {
        title: noteTitle,
        question: noteQuestion,
        answer: noteAnswer
      };
      if (backend.hasNativeBinding('save_pdf')) {
        const bytes = generateNotePdfBytes(note);
        await backend.savePdf(
          notePdfFileName(note.title),
          pdfBytesToBase64(bytes)
        );
      } else {
        await exportHtmlNoteAsPdf(note);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setExportError(`PDF export failed: ${message}`);
    } finally {
      setExporting(false);
    }
  }

  async function runPdfBenchmark() {
    if (exporting || benchmarking) return;
    setBenchmarking(true);
    setBenchmarkStatus('Benchmarking PDF renderers...');
    setExportError('');
    try {
      const result = await benchmarkNotePdf({
        title: noteTitle,
        question: noteQuestion,
        answer: noteAnswer
      });
      const summary = Object.entries(result.timings)
        .map(([name, milliseconds]) => `${name}: ${milliseconds.toFixed(0)} ms`)
        .join(' / ');
      setBenchmarkStatus(`${summary} (${result.runs} runs each)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setBenchmarkStatus('PDF benchmark failed');
      setExportError(`PDF benchmark failed: ${message}`);
    } finally {
      setBenchmarking(false);
    }
  }

  function printNoteAsPdf() {
    if (exporting || benchmarking) return;
    setExportError('');
    try {
      printNoteInSystemDialog({
        title: noteTitle,
        question: noteQuestion,
        answer: noteAnswer
      });
      setBenchmarkStatus('System print dialog opened. Choose Save to PDF.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setExportError(`System print failed: ${message}`);
    }
  }

  return (
    <section className={stylex.props(styles.toolPage).className}>
      <div className={stylex.props(styles.toolHeading).className}>
        <div>
          <p className={stylex.props(styles.eyebrow).className}>AI archive</p>
          <h1 className={stylex.props(styles.headingTitle).className}>
            Chain Notes
          </h1>
          <p className={stylex.props(styles.headingText).className}>
            Keep useful answers from external AI chats in a private local
            notebook.
          </p>
        </div>
        <span className={stylex.props(styles.mockBadge).className}>Local</span>
      </div>

      <div
        className={
          stylex.props(styles.notesLayout, styles.responsiveNotes).className
        }
      >
        <aside className={stylex.props(styles.toolPanel).className}>
          <div className={stylex.props(styles.notesListHeading).className}>
            <div>
              <span className={stylex.props(styles.panelLabel).className}>
                Notebook
              </span>
              <h2 className={stylex.props(styles.panelHeadingTitle).className}>
                {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
              </h2>
            </div>
            <button
              type="button"
              className={stylex.props(styles.newNoteButton).className}
              onClick={createNote}
            >
              + New
            </button>
          </div>
          <label>
            <span className={stylex.props(styles.srOnly).className}>
              Search notes
            </span>
            <input
              type="search"
              className={stylex.props(styles.searchInput).className}
              placeholder="Search…"
              value={noteQuery}
              onInput={(event) => setNoteQuery(event.currentTarget.value)}
            />
          </label>
          <div className={stylex.props(styles.notesList).className}>
            {filteredNotes.map((note) => (
              <button
                type="button"
                key={note.id}
                className={
                  stylex.props(
                    styles.noteListItem,
                    activeNoteId === note.id && styles.noteListActive
                  ).className
                }
                onClick={() => selectNote(note)}
              >
                <span className={stylex.props(styles.noteMeta).className}>
                  <span>{note.tag}</span>
                  <span>{note.updated}</span>
                </span>
                <strong>{note.title}</strong>
                <span className={stylex.props(styles.notePreview).className}>
                  Q: {note.question.replace(/\s+/g, ' ').slice(0, 64)}
                </span>
              </button>
            ))}
            {filteredNotes.length === 0 && (
              <p className={stylex.props(styles.emptyNotes).className}>
                No notes found.
              </p>
            )}
          </div>
        </aside>

        <article className={stylex.props(styles.toolPanel).className}>
          {storageError && (
            <p
              className={stylex.props(styles.panelNote).className}
              role="alert"
            >
              {storageError}
            </p>
          )}
          {!activeNoteId ? (
            <div>
              <p className={stylex.props(styles.panelLabel).className}>
                Empty notebook
              </p>
              <p className={stylex.props(styles.panelNote).className}>
                Create an entry to save an AI question and answer.
              </p>
              <button
                type="button"
                className={stylex.props(styles.newNoteButton).className}
                onClick={createNote}
              >
                + New Q&A
              </button>
            </div>
          ) : (
            <>
              <div className={stylex.props(styles.noteEditorHeading).className}>
                <div>
                  <span className={stylex.props(styles.panelLabel).className}>
                    Chain / {chainLabel(activeNoteId, notes)}
                  </span>
                  <span className={stylex.props(styles.noteSaved).className}>
                    Saved locally
                  </span>
                </div>
                <div className={stylex.props(styles.pdfActions).className}>
                  <button
                    type="button"
                    className={stylex.props(styles.printButton).className}
                    onClick={printNoteAsPdf}
                    disabled={exporting || benchmarking}
                  >
                    Print / Save PDF
                  </button>
                  <button
                    type="button"
                    className={stylex.props(styles.exportButton).className}
                    onClick={exportNoteAsPdf}
                    disabled={exporting || benchmarking}
                  >
                    {exporting ? '…' : 'HTML PDF'}
                  </button>
                </div>
              </div>
              {exportError && (
                <p
                  className={stylex.props(styles.panelNote).className}
                  role="alert"
                >
                  {exportError}
                </p>
              )}
              <input
                className={stylex.props(styles.noteTitleInput).className}
                aria-label="Note title"
                value={noteTitle}
                onInput={(event) => {
                  const next = event.currentTarget.value;
                  setNoteTitle(next);
                  updateNote(next, noteQuestion, noteAnswer);
                }}
              />
              <div className={stylex.props(styles.noteMetaRow).className}>
                <span>{noteWordCount} words across this exchange</span>
              </div>
              <label
                className={stylex.props(styles.formLabel).className}
                htmlFor="note-question"
              >
                Question
              </label>
              <textarea
                id="note-question"
                className={
                  stylex.props(styles.formTextarea, styles.noteQuestionInput)
                    .className
                }
                aria-label="AI chat question"
                placeholder="Paste the question you asked the AI..."
                value={noteQuestion}
                onInput={(event) => {
                  const next = event.currentTarget.value;
                  setNoteQuestion(next);
                  updateNote(noteTitle, next, noteAnswer);
                }}
              />
              <label
                className={stylex.props(styles.formLabel).className}
                htmlFor="note-answer"
              >
                AI answer
              </label>
              <textarea
                id="note-answer"
                className={
                  stylex.props(styles.formTextarea, styles.noteAnswerInput)
                    .className
                }
                aria-label="AI chat answer"
                placeholder="Paste the generated answer here..."
                value={noteAnswer}
                onInput={(event) => {
                  const next = event.currentTarget.value;
                  setNoteAnswer(next);
                  updateNote(noteTitle, noteQuestion, next);
                }}
              />
              <label
                className={stylex.props(styles.formLabel).className}
                htmlFor="note-import"
              >
                Import external chat
              </label>
              <textarea
                id="note-import"
                className={stylex.props(styles.formTextarea).className}
                aria-label="Import external chat"
                placeholder="Question: ...\n\nAnswer: ..."
                value={importText}
                onInput={(event) => setImportText(event.currentTarget.value)}
              />
              <button
                type="button"
                className={stylex.props(styles.textButton).className}
                onClick={importChat}
                disabled={!importText.trim()}
              >
                Import Q&A
              </button>
              <div className={stylex.props(styles.noteEditorFooter).className}>
                <span>
                  {benchmarkStatus || 'Saved automatically on this device.'}
                </span>
                <div className={stylex.props(styles.noteActions).className}>
                  <button
                    type="button"
                    className={stylex.props(styles.textButton).className}
                    onClick={runPdfBenchmark}
                    disabled={exporting || benchmarking}
                  >
                    {benchmarking ? 'Testing…' : 'Benchmark'}
                  </button>
                  <button
                    type="button"
                    className={stylex.props(styles.textButton).className}
                    onClick={deleteNote}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className={stylex.props(styles.textButton).className}
                    onClick={exportNoteAsPdf}
                    disabled={exporting}
                  >
                    Download →
                  </button>
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
