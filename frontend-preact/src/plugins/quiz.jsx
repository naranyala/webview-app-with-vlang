import { useEffect, useState } from 'preact/hooks';
import { backend, backendError } from '../backend.js';
import { styles, stylex } from '../stylex.js';

export const quizCollections = [
  {
    id: 'blender-fundamentals',
    title: 'Blender Fundamentals',
    description: 'Build confidence with the 3D editor, modeling, and scenes.',
    tone: 'coral',
    level: 'Beginner',
    questions: [
      {
        question: 'What is the difference between Object Mode and Edit Mode?',
        answer:
          'Object Mode transforms the whole object. Edit Mode changes its mesh data, such as vertices, edges, and faces, without changing the object origin or its relationship to the scene.',
        topic: 'Workflow'
      },
      {
        question: 'What does the 3D cursor control in Blender?',
        answer:
          'It marks a position and orientation in 3D space. It is used as a placement target for new objects and as a pivot for operations such as cursor-based transforms.',
        topic: 'Interface'
      },
      {
        question: 'Why would you apply an object scale before beveling it?',
        answer:
          'Modifiers and mesh operations use object scale when calculating dimensions. Applying the scale makes the object transform 1, 1, 1 so a bevel width behaves consistently on every axis.',
        topic: 'Modeling'
      },
      {
        question: 'What is the purpose of a normal in a mesh?',
        answer:
          'A normal describes the direction a face is pointing. Blender uses normals for shading, backface visibility, and several geometry operations.',
        topic: 'Mesh data'
      },
      {
        question: 'How does a collection help organize a Blender scene?',
        answer:
          'A collection groups objects so they can be selected, hidden, instanced, or managed together. Collections can also be nested inside other collections.',
        topic: 'Scene management'
      }
    ]
  },
  {
    id: 'blender-workflow',
    title: 'Blender Workflow',
    description:
      'Test practical knowledge of modifiers, materials, and lighting.',
    tone: 'gold',
    level: 'Intermediate',
    questions: [
      {
        question: 'What makes a modifier non-destructive?',
        answer:
          'It changes how an object is evaluated without permanently rewriting the underlying mesh. The stack can be reordered, adjusted, disabled, or applied later.',
        topic: 'Modifiers'
      },
      {
        question: 'When is a normal map preferable to adding more geometry?',
        answer:
          'Use a normal map for small surface detail that mainly affects shading. It is cheaper than modeling every detail, but it does not change the silhouette or physical outline.',
        topic: 'Materials'
      },
      {
        question:
          'What is the job of a key light in a three-point lighting setup?',
        answer:
          'The key light is the main source that establishes the subject direction, form, and overall contrast. Fill and rim lights support that primary decision.',
        topic: 'Lighting'
      },
      {
        question: 'What problem does UV unwrapping solve?',
        answer:
          'It lays a 3D surface out on a 2D plane so image textures can be assigned with predictable coordinates and minimal unwanted stretching.',
        topic: 'Texturing'
      },
      {
        question: 'Why use a reference image while modeling?',
        answer:
          'A reference gives the model measurable visual constraints for proportion, shape, and detail instead of relying only on memory or intuition.',
        topic: 'Process'
      }
    ]
  },
  {
    id: 'audio-programming',
    title: 'Audio Programming',
    description:
      'Explore signals, samples, timing, and real-time audio systems.',
    tone: 'blue',
    level: 'Intermediate',
    questions: [
      {
        question: 'What does the sample rate describe?',
        answer:
          'It is the number of samples captured or generated per second. A 48 kHz stream contains 48,000 samples per second for each channel.',
        topic: 'Digital audio'
      },
      {
        question: 'Why can an audio callback be unsafe for memory allocation?',
        answer:
          'Allocation can block or take an unpredictable amount of time. In a real-time callback that can cause glitches, so work should use preallocated memory and bounded operations.',
        topic: 'Real time'
      },
      {
        question: 'What is aliasing in a digital audio signal?',
        answer:
          'It is false frequency content created when a signal contains energy above the Nyquist frequency. Anti-alias filtering or oversampling helps prevent it.',
        topic: 'DSP'
      },
      {
        question: 'What is the difference between a mono and stereo buffer?',
        answer:
          'A mono buffer has one channel of samples. A stereo buffer has two channels, commonly left and right, which may contain different signals.',
        topic: 'Buffers'
      },
      {
        question: 'What does an envelope follower measure?',
        answer:
          'It tracks the changing amplitude of a signal, usually with separate attack and release behavior. It is useful for compression, modulation, and dynamics-driven effects.',
        topic: 'Dynamics'
      }
    ]
  },
  {
    id: 'synthesis-dsp',
    title: 'Synthesis and DSP',
    description:
      'Review oscillators, filters, spectra, and musical control signals.',
    tone: 'coral',
    level: 'Advanced',
    questions: [
      {
        question: 'What is a wavetable oscillator?',
        answer:
          'It generates a periodic waveform by reading values from a stored single-cycle table. Interpolation and table selection can reduce stepping and enable timbral changes.',
        topic: 'Oscillators'
      },
      {
        question: 'What does a low-pass filter remove?',
        answer:
          'It attenuates frequencies above its cutoff while allowing lower frequencies through. The resonance control emphasizes energy near the cutoff.',
        topic: 'Filters'
      },
      {
        question: 'What does an FFT reveal about an audio signal?',
        answer:
          'It transforms a block of time-domain samples into frequency-domain bins, showing the magnitude and often phase of spectral components.',
        topic: 'Analysis'
      },
      {
        question: 'Why is a parameter smoother useful in a synthesizer?',
        answer:
          'It turns abrupt control changes into short ramps. This prevents clicks caused by discontinuities while keeping parameter response responsive.',
        topic: 'Control'
      },
      {
        question: 'What is an LFO typically used for?',
        answer:
          'A low-frequency oscillator produces a slow periodic control signal for modulation, such as vibrato, tremolo, filter movement, or panning.',
        topic: 'Modulation'
      }
    ]
  }
];

function collectionProgress(collection, knownAnswers) {
  return collection.questions.filter((_, index) =>
    knownAnswers.includes(`${collection.id}:${index}`)
  ).length;
}

function withQuizIds(collections) {
  return collections.map((collection) => ({
    ...collection,
    questions: collection.questions.map((question, index) => ({
      ...question,
      id: question.id ?? `${collection.id}-question-${index + 1}`
    }))
  }));
}

function QuizEditor({
  collections,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  storageError
}) {
  const [selectedId, setSelectedId] = useState(collections[0].id);
  const [draft, setDraft] = useState({
    topic: 'General',
    question: '',
    answer: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [collectionDraft, setCollectionDraft] = useState({
    title: collections[0].title,
    description: collections[0].description
  });
  const collection =
    collections.find((item) => item.id === selectedId) ?? collections[0];

  function chooseCollection(item) {
    setSelectedId(item.id);
    setEditingId(null);
    setDraft({ topic: 'General', question: '', answer: '' });
    setCollectionDraft({
      title: item.title,
      description: item.description
    });
  }

  function updateDraft(event) {
    setDraft((current) => ({
      ...current,
      [event.currentTarget.name]: event.currentTarget.value
    }));
  }

  async function saveQuestion(event) {
    event.preventDefault();
    if (!draft.question.trim() || !draft.answer.trim()) return;
    const payload = {
      collection_id: selectedId,
      id: editingId ?? undefined,
      topic: draft.topic.trim() || 'General',
      question: draft.question.trim(),
      answer: draft.answer.trim()
    };
    const saved = editingId
      ? await onUpdateQuestion(payload)
      : await onCreateQuestion(payload);
    if (saved) {
      setEditingId(null);
      setDraft({ topic: 'General', question: '', answer: '' });
    }
  }

  function editQuestion(question) {
    setEditingId(question.id);
    setDraft({
      topic: question.topic,
      question: question.question,
      answer: question.answer
    });
  }

  async function saveCollection(event) {
    event.preventDefault();
    await onUpdateCollection({
      ...collection,
      title: collectionDraft.title,
      description: collectionDraft.description
    });
  }

  async function createCollection() {
    const created = await onCreateCollection();
    if (created) chooseCollection(created);
  }

  async function deleteCollection() {
    if (collections.length <= 1 || !(await onDeleteCollection(collection.id))) {
      return;
    }
    const next = collections.find((item) => item.id !== collection.id);
    if (next) chooseCollection(next);
  }

  return (
    <section
      className={stylex.props(styles.toolPage, styles.quizPage).className}
    >
      <div className={stylex.props(styles.toolHeading).className}>
        <div>
          <p className={stylex.props(styles.eyebrow).className}>
            Knowledge deck
          </p>
          <h1 className={stylex.props(styles.headingTitle).className}>
            Quiz Editor
          </h1>
          <p className={stylex.props(styles.headingText).className}>
            Extend a local collection with questions you want to remember.
          </p>
        </div>
        <span className={stylex.props(styles.mockBadge).className}>Local</span>
      </div>

      <div className={stylex.props(styles.quizEditorLayout).className}>
        <aside className={stylex.props(styles.toolPanel).className}>
          <div className={stylex.props(styles.panelHeading).className}>
            <div>
              <span className={stylex.props(styles.panelLabel).className}>
                Collections
              </span>
              <h2 className={stylex.props(styles.panelHeadingTitle).className}>
                Your deck
              </h2>
            </div>
            <span className={stylex.props(styles.panelStatus).className}>
              {collections.length}
            </span>
          </div>
          <div className={stylex.props(styles.quizLibraryList).className}>
            {collections.map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  stylex.props(
                    styles.quizLibraryItem,
                    item.id === selectedId && styles.quizLibraryItemActive
                  ).className
                }
                onClick={() => chooseCollection(item)}
              >
                <strong>{item.title}</strong>
                <span
                  className={stylex.props(styles.quizLibraryMeta).className}
                >
                  {item.questions.length} questions
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className={stylex.props(styles.secondaryButton).className}
            onClick={createCollection}
          >
            New collection
          </button>
        </aside>

        <div className={stylex.props(styles.quizEditorContent).className}>
          {storageError && (
            <p className={stylex.props(styles.error).className} role="alert">
              {storageError}
            </p>
          )}
          <form
            className={
              stylex.props(styles.toolPanel, styles.quizForm).className
            }
            onSubmit={saveCollection}
          >
            <div className={stylex.props(styles.panelHeading).className}>
              <div>
                <span className={stylex.props(styles.panelLabel).className}>
                  Collection details
                </span>
                <h2
                  className={stylex.props(styles.panelHeadingTitle).className}
                >
                  Edit collection
                </h2>
              </div>
              <span className={stylex.props(styles.panelStatus).className}>
                Local
              </span>
            </div>
            <label
              className={stylex.props(styles.formLabel).className}
              htmlFor="quiz-collection-title"
            >
              Title
            </label>
            <input
              id="quiz-collection-title"
              className={stylex.props(styles.formInput).className}
              value={collectionDraft.title}
              onInput={(event) =>
                setCollectionDraft((current) => ({
                  ...current,
                  title: event.currentTarget.value
                }))
              }
              required
            />
            <label
              className={stylex.props(styles.formLabel).className}
              htmlFor="quiz-collection-description"
            >
              Description
            </label>
            <textarea
              id="quiz-collection-description"
              className={stylex.props(styles.formTextarea).className}
              value={collectionDraft.description}
              onInput={(event) =>
                setCollectionDraft((current) => ({
                  ...current,
                  description: event.currentTarget.value
                }))
              }
              rows="2"
              required
            />
            <div className={stylex.props(styles.formActions).className}>
              <button
                type="submit"
                className={
                  stylex.props(styles.primaryButton, styles.formAction)
                    .className
                }
              >
                Save collection
              </button>
              <button
                type="button"
                className={
                  stylex.props(styles.secondaryButton, styles.formAction)
                    .className
                }
                onClick={deleteCollection}
                disabled={collections.length <= 1}
              >
                Delete collection
              </button>
            </div>
          </form>

          <form
            className={
              stylex.props(styles.toolPanel, styles.quizForm).className
            }
            onSubmit={saveQuestion}
          >
            <div className={stylex.props(styles.panelHeading).className}>
              <div>
                <span className={stylex.props(styles.panelLabel).className}>
                  {editingId ? 'Update question' : `Add to ${collection.title}`}
                </span>
                <h2
                  className={stylex.props(styles.panelHeadingTitle).className}
                >
                  {editingId ? 'Edit question' : 'New question'}
                </h2>
              </div>
              <span className={stylex.props(styles.panelStatus).className}>
                Draft
              </span>
            </div>
            <label
              className={stylex.props(styles.formLabel).className}
              htmlFor="quiz-topic"
            >
              Topic
            </label>
            <input
              id="quiz-topic"
              className={stylex.props(styles.formInput).className}
              name="topic"
              value={draft.topic}
              onInput={updateDraft}
              placeholder="e.g. Modeling"
            />
            <label
              className={stylex.props(styles.formLabel).className}
              htmlFor="quiz-question"
            >
              Question
            </label>
            <textarea
              id="quiz-question"
              className={stylex.props(styles.formTextarea).className}
              name="question"
              value={draft.question}
              onInput={updateDraft}
              placeholder="What do you want to ask?"
              rows="3"
              required
            />
            <label
              className={stylex.props(styles.formLabel).className}
              htmlFor="quiz-answer"
            >
              Answer
            </label>
            <textarea
              id="quiz-answer"
              className={stylex.props(styles.formTextarea).className}
              name="answer"
              value={draft.answer}
              onInput={updateDraft}
              placeholder="Write the explanation to reveal later."
              rows="5"
              required
            />
            <button
              type="submit"
              className={stylex.props(styles.primaryButton).className}
            >
              {editingId ? 'Save question' : 'Add question'}
            </button>
            {editingId && (
              <button
                type="button"
                className={stylex.props(styles.secondaryButton).className}
                onClick={() => {
                  setEditingId(null);
                  setDraft({ topic: 'General', question: '', answer: '' });
                }}
              >
                Cancel edit
              </button>
            )}
            <p className={stylex.props(styles.panelNote).className}>
              Changes are saved to the native quiz database when available.
            </p>
          </form>

          <div
            className={
              stylex.props(styles.toolPanel, styles.questionList).className
            }
          >
            <div className={stylex.props(styles.panelHeading).className}>
              <div>
                <span className={stylex.props(styles.panelLabel).className}>
                  Existing questions
                </span>
                <h2
                  className={stylex.props(styles.panelHeadingTitle).className}
                >
                  {collection.title}
                </h2>
              </div>
              <span className={stylex.props(styles.panelStatus).className}>
                {collection.questions.length} total
              </span>
            </div>
            <ol className={stylex.props(styles.questionListItems).className}>
              {collection.questions.map((item) => (
                <li
                  className={stylex.props(styles.questionListItem).className}
                  key={item.id}
                >
                  <span
                    className={stylex.props(styles.questionNumber).className}
                    aria-hidden="true"
                  />
                  <span
                    className={stylex.props(styles.questionTopic).className}
                  >
                    {item.topic}
                  </span>
                  <strong
                    className={stylex.props(styles.questionText).className}
                  >
                    {item.question}
                  </strong>
                  <div
                    className={stylex.props(styles.questionActions).className}
                  >
                    <button
                      type="button"
                      className={stylex.props(styles.questionAction).className}
                      onClick={() => editQuestion(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={stylex.props(styles.questionAction).className}
                      onClick={() =>
                        onDeleteQuestion({
                          collection_id: collection.id,
                          id: item.id
                        })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Quiz({ view = 'session' }) {
  const [collections, setCollections] = useState(() =>
    withQuizIds(quizCollections)
  );
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    let mounted = true;
    backend
      .quizList()
      .then((storedCollections) => {
        if (mounted && Array.isArray(storedCollections)) {
          setCollections(withQuizIds(storedCollections));
        }
      })
      .catch((error) => {
        if (mounted) setStorageError(backendError(error));
      });
    return () => {
      mounted = false;
    };
  }, []);

  function replaceCollection(updated) {
    if (!updated?.id) return false;
    setCollections((current) =>
      current.map((item) =>
        item.id === updated.id ? withQuizIds([updated])[0] : item
      )
    );
    return true;
  }

  async function createCollection() {
    try {
      setStorageError('');
      const payload = {
        title: 'New collection',
        description: 'A collection for questions you are building.',
        tone: 'gold',
        level: 'Custom',
        questions: []
      };
      const stored = await backend.quizCreateCollection(payload);
      const created = stored ?? {
        ...payload,
        id: `custom-${Date.now()}`
      };
      setCollections((current) => [...current, withQuizIds([created])[0]]);
      return created;
    } catch (error) {
      setStorageError(backendError(error));
      return null;
    }
  }

  async function updateCollection(collection) {
    try {
      setStorageError('');
      const stored = await backend.quizUpdateCollection(collection);
      return replaceCollection(stored ?? collection);
    } catch (error) {
      setStorageError(backendError(error));
      return false;
    }
  }

  async function deleteCollection(id) {
    try {
      setStorageError('');
      await backend.quizDeleteCollection(id);
      setCollections((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      setStorageError(backendError(error));
      return false;
    }
  }

  async function createQuestion(payload) {
    try {
      setStorageError('');
      const stored = await backend.quizCreateQuestion(payload);
      if (stored) return replaceCollection(stored);
      setCollections((current) =>
        current.map((item) =>
          item.id === payload.collection_id
            ? {
                ...item,
                questions: [
                  ...item.questions,
                  { ...payload, id: `question-${Date.now()}` }
                ]
              }
            : item
        )
      );
      return true;
    } catch (error) {
      setStorageError(backendError(error));
      return false;
    }
  }

  async function updateQuestion(payload) {
    try {
      setStorageError('');
      const stored = await backend.quizUpdateQuestion(payload);
      if (stored) return replaceCollection(stored);
      setCollections((current) =>
        current.map((item) =>
          item.id === payload.collection_id
            ? {
                ...item,
                questions: item.questions.map((question) =>
                  question.id === payload.id
                    ? { ...question, ...payload }
                    : question
                )
              }
            : item
        )
      );
      return true;
    } catch (error) {
      setStorageError(backendError(error));
      return false;
    }
  }

  async function deleteQuestion(payload) {
    try {
      setStorageError('');
      const stored = await backend.quizDeleteQuestion(payload);
      if (stored) return replaceCollection(stored);
      setCollections((current) =>
        current.map((item) =>
          item.id === payload.collection_id
            ? {
                ...item,
                questions: item.questions.filter(
                  (question) => question.id !== payload.id
                )
              }
            : item
        )
      );
      return true;
    } catch (error) {
      setStorageError(backendError(error));
      return false;
    }
  }

  if (view === 'editor') {
    return (
      <QuizEditor
        collections={collections}
        onCreateCollection={createCollection}
        onUpdateCollection={updateCollection}
        onDeleteCollection={deleteCollection}
        onCreateQuestion={createQuestion}
        onUpdateQuestion={updateQuestion}
        onDeleteQuestion={deleteQuestion}
        storageError={storageError}
      />
    );
  }

  return <QuizSession collections={collections} />;
}

function QuizSession({ collections }) {
  const [collectionId, setCollectionId] = useState(quizCollections[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [knownAnswers, setKnownAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);

  const collection =
    collections.find((item) => item.id === collectionId) ?? collections[0];
  const question = collection.questions[questionIndex];
  const answerKey = `${collection.id}:${questionIndex}`;
  const learnedCount = collectionProgress(collection, knownAnswers);

  function chooseCollection(nextId) {
    setCollectionId(nextId);
    setQuestionIndex(0);
    setRevealed(false);
    setCompleted(false);
  }

  function advance(wasKnown) {
    if (wasKnown) {
      setKnownAnswers((current) =>
        current.includes(answerKey) ? current : [...current, answerKey]
      );
    }
    if (questionIndex === collection.questions.length - 1) {
      setCompleted(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setRevealed(false);
  }

  function restartCollection() {
    setKnownAnswers((current) =>
      current.filter((key) => !key.startsWith(`${collection.id}:`))
    );
    setQuestionIndex(0);
    setRevealed(false);
    setCompleted(false);
  }

  if (!question) {
    return (
      <section
        className={stylex.props(styles.toolPage, styles.quizPage).className}
      >
        <div className={stylex.props(styles.toolHeading).className}>
          <div>
            <p className={stylex.props(styles.eyebrow).className}>
              Knowledge deck
            </p>
            <h1 className={stylex.props(styles.headingTitle).className}>
              Quiz Session
            </h1>
            <p className={stylex.props(styles.headingText).className}>
              {collection.title} does not have any questions yet.
            </p>
          </div>
          <span className={stylex.props(styles.mockBadge).className}>
            Local
          </span>
        </div>
        <div
          className={stylex.props(styles.toolPanel, styles.quizEmpty).className}
        >
          <span className={stylex.props(styles.panelLabel).className}>
            Empty collection
          </span>
          <p className={stylex.props(styles.panelNote).className}>
            Open Quiz Editor from the sidebar to add the first question.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={stylex.props(styles.toolPage, styles.quizPage).className}
    >
      <div className={stylex.props(styles.toolHeading).className}>
        <div>
          <p className={stylex.props(styles.eyebrow).className}>
            Knowledge deck
          </p>
          <h1 className={stylex.props(styles.headingTitle).className}>Quiz</h1>
          <p className={stylex.props(styles.headingText).className}>
            Pick a collection, think first, then reveal the answer.
          </p>
        </div>
        <span className={stylex.props(styles.mockBadge).className}>Local</span>
      </div>

      <nav
        className={stylex.props(styles.quizCollections).className}
        aria-label="Quiz collections"
      >
        {collections.map((item) => {
          const progress = collectionProgress(item, knownAnswers);
          return (
            <button
              type="button"
              key={item.id}
              className={
                stylex.props(
                  styles.quizCollection,
                  item.id === collection.id && styles.quizCollectionActive
                ).className
              }
              onClick={() => chooseCollection(item.id)}
              aria-pressed={item.id === collection.id}
            >
              <span className={stylex.props(styles.collectionKicker).className}>
                {item.level}
              </span>
              <strong
                className={stylex.props(styles.collectionTitle).className}
              >
                {item.title}
              </strong>
              <small
                className={stylex.props(styles.collectionDescription).className}
              >
                {item.description}
              </small>
              <span className={stylex.props(styles.collectionMeta).className}>
                {progress}/{item.questions.length} learned
              </span>
            </button>
          );
        })}
      </nav>

      <div
        className={
          stylex.props(styles.toolPanel, styles.quizProgressPanel).className
        }
      >
        <div className={stylex.props(styles.panelHeading).className}>
          <div>
            <span className={stylex.props(styles.panelLabel).className}>
              Current collection
            </span>
            <h2 className={stylex.props(styles.panelHeadingTitle).className}>
              {collection.title}
            </h2>
          </div>
          <span className={stylex.props(styles.panelStatus).className}>
            {learnedCount}/{collection.questions.length} learned
          </span>
        </div>
        <div
          className={stylex.props(styles.quizProgressTrack).className}
          role="progressbar"
          aria-label="Collection progress"
          aria-valuemin="0"
          aria-valuemax={collection.questions.length}
          aria-valuenow={learnedCount}
        >
          <span
            className={stylex.props(styles.quizProgressFill).className}
            style={`width: ${(learnedCount / collection.questions.length) * 100}%`}
          />
        </div>
      </div>

      {completed ? (
        <div
          className={
            stylex.props(styles.toolPanel, styles.quizComplete).className
          }
        >
          <span
            className={stylex.props(styles.quizCompleteMark).className}
            aria-hidden="true"
          >
            +
          </span>
          <div className={stylex.props(styles.quizCompleteCopy).className}>
            <span className={stylex.props(styles.panelLabel).className}>
              Collection complete
            </span>
            <h2 className={stylex.props(styles.quizCompleteTitle).className}>
              Good pass through the deck.
            </h2>
            <p className={stylex.props(styles.quizCompleteText).className}>
              You marked {learnedCount} of {collection.questions.length} answers
              as known. Review the collection again whenever you want to refresh
              it.
            </p>
          </div>
          <button
            type="button"
            className={stylex.props(styles.primaryButton).className}
            onClick={restartCollection}
          >
            Restart collection
          </button>
        </div>
      ) : (
        <article
          className={stylex.props(styles.toolPanel, styles.quizCard).className}
        >
          <div className={stylex.props(styles.quizCardTopline).className}>
            <span className={stylex.props(styles.panelLabel).className}>
              Question {questionIndex + 1}
            </span>
            <span className={stylex.props(styles.quizTopic).className}>
              {question.topic}
            </span>
          </div>
          <h2 className={stylex.props(styles.quizQuestionTitle).className}>
            {question.question}
          </h2>
          <div
            className={
              stylex.props(
                styles.quizAnswer,
                revealed && styles.quizAnswerRevealed
              ).className
            }
          >
            {revealed ? (
              <>
                <span className={stylex.props(styles.panelLabel).className}>
                  Answer
                </span>
                <p className={stylex.props(styles.quizAnswerText).className}>
                  {question.answer}
                </p>
              </>
            ) : (
              <p className={stylex.props(styles.quizAnswerText).className}>
                Take a moment to answer from memory.
              </p>
            )}
          </div>
          {!revealed ? (
            <button
              type="button"
              className={stylex.props(styles.primaryButton).className}
              onClick={() => setRevealed(true)}
            >
              Reveal answer
            </button>
          ) : (
            <div className={stylex.props(styles.quizActions).className}>
              <button
                type="button"
                className={stylex.props(styles.secondaryButton).className}
                onClick={() => advance(false)}
              >
                Review later
              </button>
              <button
                type="button"
                className={stylex.props(styles.primaryButton).className}
                onClick={() => advance(true)}
              >
                I knew it
              </button>
            </div>
          )}
          <div className={stylex.props(styles.quizFooter).className}>
            <span>
              {questionIndex + 1} of {collection.questions.length}
            </span>
            <span>Answer from memory before revealing</span>
          </div>
        </article>
      )}
    </section>
  );
}
