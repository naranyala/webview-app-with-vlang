import { useEffect, useState } from 'preact/hooks';
import {
  loadAcademicPapers,
  saveAcademicPapers
} from '../academic-paper-model.mjs';
import {
  exportAcademicPaperAsPdf,
  printAcademicPaperInSystemDialog
} from '../academic-paper-pdf.mjs';
import { styles, stylex } from '../stylex.js';

function countPaperWords(paper) {
  const content = [
    paper.title,
    paper.subtitle,
    paper.abstract,
    ...paper.sections.flatMap((section) =>
      section.blocks.flatMap((block) =>
        block.type === 'list' ? block.items : block.text || block.code || ''
      )
    )
  ].join(' ');
  return content.trim() ? content.trim().split(/\s+/).length : 0;
}

function renderBlock(block, index) {
  if (block.type === 'paragraph') {
    return (
      <p {...stylex.props(styles.paperSectionParagraph)} key={index}>
        {block.text}
      </p>
    );
  }
  if (block.type === 'quote') {
    return (
      <blockquote {...stylex.props(styles.paperSectionQuote)} key={index}>
        {block.text}
      </blockquote>
    );
  }
  if (block.type === 'list') {
    return (
      <ul {...stylex.props(styles.paperSectionList)} key={index}>
        {block.items.map((item) => (
          <li {...stylex.props(styles.paperSectionListItem)} key={item}>
            {item}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'code') {
    return (
      <figure {...stylex.props(styles.paperCode)} key={index}>
        <figcaption {...stylex.props(styles.paperCodeLabel)}>
          {block.language}
        </figcaption>
        <pre {...stylex.props(styles.paperCodePre)}>
          <code {...stylex.props(styles.paperCodeText)}>{block.code}</code>
        </pre>
      </figure>
    );
  }
  return null;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatReference(draft, index) {
  const author = draft.authors.trim() || 'Unknown author';
  const title = draft.title.trim() || 'Untitled source';
  const details = [draft.type.trim() || 'Other', draft.year.trim()]
    .filter(Boolean)
    .join(', ');
  const locatorValue = draft.locator.trim();
  const locator = locatorValue
    ? locatorValue.startsWith('http')
      ? locatorValue
      : `doi:${locatorValue}`
    : '';
  return {
    id: createId('reference'),
    label: `[${index + 1}]`,
    authors: draft.authors.trim(),
    year: draft.year.trim(),
    title,
    type: draft.type.trim() || 'Other',
    doi: locatorValue.startsWith('http') ? '' : locatorValue,
    url: locatorValue.startsWith('http') ? locatorValue : '',
    text: `${author}. ${title}. ${details}.${locator ? ` ${locator}.` : ''}`
  };
}

function ReferenceManager({
  paper,
  query,
  onQueryChange,
  draft,
  onDraftChange,
  onAdd,
  onRemove
}) {
  const references = paper.references.filter((reference) => {
    const searchable = [
      reference.authors,
      reference.title,
      reference.text,
      reference.doi,
      reference.url
    ]
      .join(' ')
      .toLowerCase();
    return !query.trim() || searchable.includes(query.trim().toLowerCase());
  });

  return (
    <section {...stylex.props(styles.managerPanel)}>
      <header {...stylex.props(styles.submenuHeader)}>
        <div>
          <p {...stylex.props(styles.eyebrow)}>Citations</p>
          <h2 {...stylex.props(styles.submenuTitle)}>Reference Manager</h2>
          <p {...stylex.props(styles.submenuDescription)}>
            Keep source metadata close to the paper and generate a consistent
            reference list.
          </p>
        </div>
        <span {...stylex.props(styles.submenuCount)}>
          {paper.references.length} sources
        </span>
      </header>

      <div
        {...stylex.props(styles.managerLayout, styles.responsiveManagerLayout)}
      >
        <form {...stylex.props(styles.managerForm)} onSubmit={onAdd}>
          <p {...stylex.props(styles.paperRailLabel)}>Add source</p>
          <label {...stylex.props(styles.managerLabel)}>
            Authors
            <input
              {...stylex.props(styles.managerInput)}
              value={draft.authors}
              onInput={(event) =>
                onDraftChange('authors', event.currentTarget.value)
              }
              placeholder="Surname, A."
            />
          </label>
          <label {...stylex.props(styles.managerLabel)}>
            Title <span aria-hidden="true">*</span>
            <input
              {...stylex.props(styles.managerInput)}
              value={draft.title}
              onInput={(event) =>
                onDraftChange('title', event.currentTarget.value)
              }
              placeholder="Source title"
              required
            />
          </label>
          <div {...stylex.props(styles.managerFormRow)}>
            <label {...stylex.props(styles.managerLabel)}>
              Year
              <input
                {...stylex.props(styles.managerInput)}
                value={draft.year}
                onInput={(event) =>
                  onDraftChange('year', event.currentTarget.value)
                }
                placeholder="2026"
              />
            </label>
            <label {...stylex.props(styles.managerLabel)}>
              Type
              <select
                {...stylex.props(styles.managerInput)}
                value={draft.type}
                onChange={(event) =>
                  onDraftChange('type', event.currentTarget.value)
                }
              >
                <option>Article</option>
                <option>Book</option>
                <option>Report</option>
                <option>Working notes</option>
                <option>Website</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <label {...stylex.props(styles.managerLabel)}>
            DOI or URL
            <input
              {...stylex.props(styles.managerInput)}
              value={draft.locator}
              onInput={(event) =>
                onDraftChange('locator', event.currentTarget.value)
              }
              placeholder="10.1000/example"
            />
          </label>
          <button type="submit" {...stylex.props(styles.managerPrimaryButton)}>
            Add reference
          </button>
        </form>

        <div {...stylex.props(styles.managerListPanel)}>
          <div {...stylex.props(styles.managerListHeader)}>
            <div>
              <p {...stylex.props(styles.paperRailLabel)}>Library</p>
              <strong>{references.length} matching sources</strong>
            </div>
            <input
              {...stylex.props(styles.managerSearch)}
              value={query}
              onInput={(event) => onQueryChange(event.currentTarget.value)}
              placeholder="Search references"
              aria-label="Search references"
            />
          </div>
          <div {...stylex.props(styles.referenceList)}>
            {references.length > 0 ? (
              references.map((reference) => (
                <article
                  {...stylex.props(styles.referenceCard)}
                  key={reference.id}
                >
                  <div {...stylex.props(styles.referenceCardLabel)}>
                    {reference.label}
                  </div>
                  <div {...stylex.props(styles.referenceCardBody)}>
                    <strong>{reference.title}</strong>
                    <p {...stylex.props(styles.referenceCardText)}>
                      {reference.text}
                    </p>
                    <small {...stylex.props(styles.referenceCardMeta)}>
                      {reference.type}
                      {reference.year && ` / ${reference.year}`}
                    </small>
                  </div>
                  <button
                    type="button"
                    {...stylex.props(styles.referenceDelete)}
                    onClick={() => onRemove(reference.id)}
                    aria-label={`Remove ${reference.title}`}
                  >
                    Remove
                  </button>
                </article>
              ))
            ) : (
              <p {...stylex.props(styles.emptyManager)}>No matching sources.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageAssets({ paper, onUpload, onRemove, error }) {
  return (
    <section {...stylex.props(styles.managerPanel)}>
      <header {...stylex.props(styles.submenuHeader)}>
        <div>
          <p {...stylex.props(styles.eyebrow)}>Media library</p>
          <h2 {...stylex.props(styles.submenuTitle)}>Image Assets</h2>
          <p {...stylex.props(styles.submenuDescription)}>
            Store figures, charts, and visual evidence alongside the paper.
            Assets stay local until you export or place them in a document.
          </p>
        </div>
        <label {...stylex.props(styles.assetUploadButton)}>
          <input
            {...stylex.props(styles.assetFileInput)}
            type="file"
            accept="image/*"
            multiple
            onChange={onUpload}
          />
          Add images
        </label>
      </header>

      {error && (
        <p {...stylex.props(styles.error)} role="alert">
          {error}
        </p>
      )}

      {paper.assets.length > 0 ? (
        <div {...stylex.props(styles.assetGrid)}>
          {paper.assets.map((asset) => (
            <figure {...stylex.props(styles.assetCard)} key={asset.id}>
              <img
                {...stylex.props(styles.assetImage)}
                src={asset.src}
                alt={asset.alt}
              />
              <figcaption {...stylex.props(styles.assetCaption)}>
                <strong>{asset.name}</strong>
                <small {...stylex.props(styles.assetCaptionText)}>
                  {asset.caption || asset.alt}
                </small>
              </figcaption>
              <button
                type="button"
                {...stylex.props(styles.referenceDelete)}
                onClick={() => onRemove(asset.id)}
              >
                Remove
              </button>
            </figure>
          ))}
        </div>
      ) : (
        <label {...stylex.props(styles.assetEmpty)}>
          <input
            {...stylex.props(styles.assetFileInput)}
            type="file"
            accept="image/*"
            multiple
            onChange={onUpload}
          />
          <strong>Drop your figures here</strong>
          <span {...stylex.props(styles.assetEmptyText)}>
            PNG, JPEG, GIF, and SVG files are stored in this browser.
          </span>
        </label>
      )}
    </section>
  );
}

export function AcademicPaper({ paperView }) {
  const [papers, setPapers] = useState(loadAcademicPapers);
  const [activePaperId, setActivePaperId] = useState(
    () => papers[0]?.id ?? null
  );
  const [workspaceView, setWorkspaceView] = useState('reader');
  const [referenceQuery, setReferenceQuery] = useState('');
  const [referenceDraft, setReferenceDraft] = useState({
    authors: '',
    title: '',
    year: '',
    type: 'Article',
    locator: ''
  });
  const [storageError, setStorageError] = useState('');
  const [assetError, setAssetError] = useState('');
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const paper = papers.find((item) => item.id === activePaperId) ?? papers[0];

  useEffect(() => {
    setStorageError(
      saveAcademicPapers(papers)
        ? ''
        : 'Local paper changes could not be saved in this browser.'
    );
  }, [papers]);

  useEffect(() => {
    if (paperView) setWorkspaceView(paperView);
  }, [paperView]);

  if (!paper) {
    return (
      <section {...stylex.props(styles.academicPage)}>
        <p {...stylex.props(styles.eyebrow)}>Library</p>
        <h1 {...stylex.props(styles.pageTitle)}>Academic Paper</h1>
        <p {...stylex.props(styles.mutedText)}>
          No papers are available in the local library.
        </p>
      </section>
    );
  }

  async function exportPaper() {
    if (exporting) return;
    setExporting(true);
    setExportError('');
    try {
      await exportAcademicPaperAsPdf(paper);
    } catch {
      setExportError('The PDF export could not be created in this browser.');
    } finally {
      setExporting(false);
    }
  }

  function printPaper() {
    setExportError('');
    try {
      printAcademicPaperInSystemDialog(paper);
    } catch {
      setExportError('The print dialog could not be opened.');
    }
  }

  function scrollToSection(sectionId) {
    document
      .getElementById(`paper-section-${sectionId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openSection(sectionId) {
    setWorkspaceView('reader');
    window.setTimeout(() => scrollToSection(sectionId), 0);
  }

  function updatePaper(update) {
    setPapers((current) =>
      current.map((item) =>
        item.id === paper.id
          ? {
              ...item,
              ...(typeof update === 'function' ? update(item) : update)
            }
          : item
      )
    );
  }

  function updateReferenceDraft(field, value) {
    setReferenceDraft((current) => ({ ...current, [field]: value }));
  }

  function addReference(event) {
    event.preventDefault();
    const reference = formatReference(referenceDraft, paper.references.length);
    updatePaper((current) => ({
      references: [...current.references, reference]
    }));
    setReferenceDraft({
      authors: '',
      title: '',
      year: '',
      type: 'Article',
      locator: ''
    });
  }

  function removeReference(referenceId) {
    updatePaper((current) => ({
      references: current.references
        .filter((reference) => reference.id !== referenceId)
        .map((reference, index) => ({
          ...reference,
          label: `[${index + 1}]`
        }))
    }));
  }

  async function uploadAssets(event) {
    const files = Array.from(event.currentTarget.files || []).filter((file) =>
      file.type.startsWith('image/')
    );
    event.currentTarget.value = '';
    if (!files.length) {
      setAssetError('Choose one or more image files to add.');
      return;
    }
    setAssetError('');
    try {
      const assets = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  id: createId('asset'),
                  name: file.name,
                  type: file.type,
                  src: reader.result,
                  alt: file.name,
                  caption: ''
                });
              reader.onerror = () => reject(new Error('Could not read image.'));
              reader.readAsDataURL(file);
            })
        )
      );
      updatePaper((current) => ({ assets: [...current.assets, ...assets] }));
    } catch {
      setAssetError('One or more images could not be read.');
    }
  }

  function removeAsset(assetId) {
    updatePaper((current) => ({
      assets: current.assets.filter((asset) => asset.id !== assetId)
    }));
  }

  const wordCount = countPaperWords(paper);
  const authorNames = paper.authors.map((author) => author.name).join(', ');

  return (
    <section {...stylex.props(styles.academicPage)}>
      <header {...stylex.props(styles.academicToolbar)}>
        <div>
          <p {...stylex.props(styles.eyebrow)}>Research desk</p>
          <h1 {...stylex.props(styles.pageTitle)}>Academic Paper</h1>
        </div>
        <div {...stylex.props(styles.pdfActions)}>
          <button
            type="button"
            {...stylex.props(styles.printButton)}
            onClick={printPaper}
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            {...stylex.props(styles.exportButton)}
            onClick={exportPaper}
            disabled={exporting}
          >
            {exporting ? 'Building PDF...' : 'Download PDF'}
          </button>
        </div>
      </header>

      {exportError && (
        <p {...stylex.props(styles.error)} role="alert">
          {exportError}
        </p>
      )}
      {storageError && (
        <p {...stylex.props(styles.error)} role="alert">
          {storageError}
        </p>
      )}

      <div
        {...stylex.props(
          styles.academicLayout,
          styles.responsiveAcademicLayout
        )}
      >
        <aside
          {...stylex.props(styles.paperRail)}
          aria-label="Paper navigation"
        >
          <div>
            <p {...stylex.props(styles.paperRailLabel)}>Workspace</p>
            <nav
              {...stylex.props(styles.paperWorkspaceNav)}
              aria-label="Paper workspace"
            >
              <button
                type="button"
                {...stylex.props(
                  styles.paperWorkspaceButton,
                  workspaceView === 'reader' &&
                    styles.paperWorkspaceButtonActive
                )}
                onClick={() => setWorkspaceView('reader')}
                aria-current={workspaceView === 'reader' ? 'page' : undefined}
              >
                <span>Reader</span>
                <small {...stylex.props(styles.paperWorkspaceButtonMeta)}>
                  Read and export
                </small>
              </button>
              <button
                type="button"
                {...stylex.props(
                  styles.paperWorkspaceButton,
                  workspaceView === 'references' &&
                    styles.paperWorkspaceButtonActive
                )}
                onClick={() => setWorkspaceView('references')}
                aria-current={
                  workspaceView === 'references' ? 'page' : undefined
                }
              >
                <span>Reference Manager</span>
                <small {...stylex.props(styles.paperWorkspaceButtonMeta)}>
                  {paper.references.length} sources
                </small>
              </button>
              <button
                type="button"
                {...stylex.props(
                  styles.paperWorkspaceButton,
                  workspaceView === 'assets' &&
                    styles.paperWorkspaceButtonActive
                )}
                onClick={() => setWorkspaceView('assets')}
                aria-current={workspaceView === 'assets' ? 'page' : undefined}
              >
                <span>Image Assets</span>
                <small {...stylex.props(styles.paperWorkspaceButtonMeta)}>
                  {paper.assets.length} files
                </small>
              </button>
            </nav>
          </div>
          <div>
            <p {...stylex.props(styles.paperRailLabel)}>Library</p>
            <div {...stylex.props(styles.paperLibrary)}>
              {papers.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  {...stylex.props(
                    styles.paperLibraryItem,
                    item.id === paper.id && styles.paperLibraryItemActive
                  )}
                  onClick={() => setActivePaperId(item.id)}
                  aria-current={item.id === paper.id ? 'page' : undefined}
                >
                  <strong {...stylex.props(styles.paperLibraryItemTitle)}>
                    {item.title}
                  </strong>
                  <small {...stylex.props(styles.paperLibraryItemMeta)}>
                    {item.venue || 'Draft paper'}
                  </small>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p {...stylex.props(styles.paperRailLabel)}>Contents</p>
            <nav
              {...stylex.props(styles.paperContents)}
              aria-label="Paper contents"
            >
              <button
                type="button"
                {...stylex.props(styles.paperContentsButton)}
                onClick={() => openSection('abstract')}
              >
                Abstract
              </button>
              {paper.sections.map((section) => (
                <button
                  type="button"
                  key={section.id}
                  {...stylex.props(styles.paperContentsButton)}
                  onClick={() => openSection(section.id)}
                >
                  {section.heading}
                </button>
              ))}
              {paper.references.length > 0 && (
                <button
                  type="button"
                  {...stylex.props(styles.paperContentsButton)}
                  onClick={() => openSection('references')}
                >
                  References
                </button>
              )}
            </nav>
          </div>

          <dl {...stylex.props(styles.paperStats)}>
            <div {...stylex.props(styles.paperStat)}>
              <dt {...stylex.props(styles.paperStatLabel)}>Words</dt>
              <dd {...stylex.props(styles.paperStatValue)}>
                {wordCount.toLocaleString()}
              </dd>
            </div>
            <div {...stylex.props(styles.paperStat)}>
              <dt {...stylex.props(styles.paperStatLabel)}>Sections</dt>
              <dd {...stylex.props(styles.paperStatValue)}>
                {paper.sections.length}
              </dd>
            </div>
            <div {...stylex.props(styles.paperStat)}>
              <dt {...stylex.props(styles.paperStatLabel)}>Format</dt>
              <dd {...stylex.props(styles.paperStatValue)}>2 columns</dd>
            </div>
          </dl>
        </aside>

        {workspaceView === 'reader' && (
          <article {...stylex.props(styles.paperDocument)}>
            <header {...stylex.props(styles.paperHeader)}>
              <p {...stylex.props(styles.paperKicker)}>
                {paper.venue || 'Academic paper'}{' '}
                {paper.year && ` / ${paper.year}`}
              </p>
              <h2 {...stylex.props(styles.paperTitle)}>{paper.title}</h2>
              {paper.subtitle && (
                <p {...stylex.props(styles.paperSubtitle)}>{paper.subtitle}</p>
              )}
              <p {...stylex.props(styles.paperByline)}>
                {authorNames || 'Anonymous author'}
              </p>
              {paper.authors.some((author) => author.affiliation) && (
                <p {...stylex.props(styles.paperAffiliation)}>
                  {[
                    ...new Set(
                      paper.authors
                        .map((author) => author.affiliation)
                        .filter(Boolean)
                    )
                  ].join(' / ')}
                </p>
              )}
            </header>

            <section
              {...stylex.props(styles.paperAbstract)}
              id="paper-section-abstract"
            >
              <h3 {...stylex.props(styles.paperAbstractHeading)}>Abstract</h3>
              <p {...stylex.props(styles.paperAbstractText)}>
                {paper.abstract || 'No abstract has been added.'}
              </p>
              {paper.keywords.length > 0 && (
                <p {...stylex.props(styles.paperKeywords)}>
                  <strong>Keywords</strong> {paper.keywords.join(' / ')}
                </p>
              )}
            </section>

            <div
              {...stylex.props(
                styles.paperColumns,
                styles.responsivePaperColumns
              )}
            >
              {paper.sections.map((section) => (
                <section
                  {...stylex.props(styles.paperSection)}
                  id={`paper-section-${section.id}`}
                  key={section.id}
                >
                  <h3 {...stylex.props(styles.paperSectionTitle)}>
                    {section.heading}
                  </h3>
                  {section.blocks.map(renderBlock)}
                </section>
              ))}
              {paper.references.length > 0 && (
                <section
                  {...stylex.props(styles.paperReferences)}
                  id="paper-section-references"
                >
                  <h3 {...stylex.props(styles.paperSectionTitle)}>
                    References
                  </h3>
                  {paper.references.map((reference) => (
                    <p
                      {...stylex.props(styles.paperReference)}
                      key={reference.id}
                    >
                      <strong>{reference.label}</strong> {reference.text}
                    </p>
                  ))}
                </section>
              )}
            </div>
          </article>
        )}
        {workspaceView === 'references' && (
          <ReferenceManager
            paper={paper}
            query={referenceQuery}
            onQueryChange={setReferenceQuery}
            draft={referenceDraft}
            onDraftChange={updateReferenceDraft}
            onAdd={addReference}
            onRemove={removeReference}
          />
        )}
        {workspaceView === 'assets' && (
          <ImageAssets
            paper={paper}
            onUpload={uploadAssets}
            onRemove={removeAsset}
            error={assetError}
          />
        )}
      </div>
    </section>
  );
}
