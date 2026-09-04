import { useMemo, useState } from 'preact/hooks';
import { backend, backendError } from './backend.js';
import { BackendStatus } from './backend-status.jsx';
import { ErrorBoundary } from './error-boundary.jsx';
import { frontendPlugins, getFrontendPlugin } from './plugins/index.js';
import { styles, stylex } from './stylex.js';

const TAB_SHORT = {
  disk: 'Disk',
  equalizer: 'EQ',
  notes: 'Notes',
  todos: 'Todos',
  quiz: 'Quiz',
  paper: 'Paper'
};

const TAB_GLYPH = {
  disk: '◉',
  equalizer: '♪',
  notes: '✎',
  todos: '✓',
  quiz: '?',
  paper: '▤'
};

const TOOLS_GROUP_IDS = ['disk', 'equalizer'];
const QUIZ_GROUP_ID = 'quiz';
const PAPER_GROUP_ID = 'paper';
const TODO_GROUP_ID = 'todos';
const QUIZ_MENU_ITEMS = [
  {
    id: 'session',
    title: 'Quiz Session',
    description: 'Practice cards and track what you know.'
  },
  {
    id: 'editor',
    title: 'Quiz Editor',
    description: 'Add your own questions to a local collection.'
  }
];
const PAPER_MENU_ITEMS = [
  {
    id: 'reader',
    title: 'Reader',
    description: 'Read and export the active paper.'
  },
  {
    id: 'references',
    title: 'Reference Manager',
    description: 'Organize sources and generate citations.'
  },
  {
    id: 'assets',
    title: 'Image Assets',
    description: 'Keep figures and visual evidence beside the paper.'
  }
];
const TODO_MENU_ITEMS = [
  {
    id: 'list',
    title: 'Todo List',
    description: 'Capture and complete the work in front of you.'
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'Pick a month and see scheduled todos by day.'
  }
];

export function App() {
  const [activeApp, setActiveApp] = useState(null);
  const [openedApps, setOpenedApps] = useState([]);
  const [windowActionPending, setWindowActionPending] = useState(false);
  const [windowError, setWindowError] = useState('');
  const [windowMaximized, setWindowMaximized] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [isNative] = useState(() => backend.isNative());

  const topLevelPlugins = useMemo(
    () =>
      frontendPlugins.filter(
        (plugin) =>
          !TOOLS_GROUP_IDS.includes(plugin.id) &&
          plugin.id !== QUIZ_GROUP_ID &&
          plugin.id !== PAPER_GROUP_ID &&
          plugin.id !== TODO_GROUP_ID
      ),
    []
  );
  const toolsPlugins = useMemo(
    () =>
      frontendPlugins.filter((plugin) => TOOLS_GROUP_IDS.includes(plugin.id)),
    []
  );
  const toolsActive = TOOLS_GROUP_IDS.includes(activeApp);
  const quizActive = activeApp === QUIZ_GROUP_ID;
  const paperActive = activeApp === PAPER_GROUP_ID;
  const todoActive = activeApp === TODO_GROUP_ID;
  const showToolsMenu = openMenu === 'tools';
  const showQuizMenu = openMenu === 'quiz';
  const showPaperMenu = openMenu === 'paper';
  const showTodoMenu = openMenu === 'todos';
  const [quizView, setQuizView] = useState('session');
  const [paperView, setPaperView] = useState('reader');
  const [todoView, setTodoView] = useState('list');

  function toggleMenu(menuId) {
    setOpenMenu((current) => (current === menuId ? null : menuId));
  }

  const openedWorkspaces = useMemo(
    () => frontendPlugins.filter((plugin) => openedApps.includes(plugin.id)),
    [openedApps]
  );
  const currentApp = getFrontendPlugin(activeApp);
  const ActivePlugin = currentApp?.component;

  function selectApp(appId) {
    if (windowActionPending) return;
    setWindowError('');
    if (TOOLS_GROUP_IDS.includes(appId)) {
      setOpenMenu('tools');
    } else if (appId === QUIZ_GROUP_ID) {
      setOpenMenu('quiz');
    } else if (appId === PAPER_GROUP_ID) {
      setOpenMenu('paper');
    } else if (appId === TODO_GROUP_ID) {
      setOpenMenu('todos');
    } else {
      setOpenMenu(null);
    }
    setOpenedApps((current) =>
      current.includes(appId) ? current : [...current, appId]
    );
    setActiveApp(appId);
    if (typeof document !== 'undefined') {
      const plugin = getFrontendPlugin(appId);
      document.title = plugin ? `${plugin.title} - WebView App` : 'WebView App';
      window.scrollTo?.(0, 0);
    }
  }

  function selectQuizView(view) {
    setQuizView(view);
    selectApp(QUIZ_GROUP_ID);
  }

  function selectPaperView(view) {
    setPaperView(view);
    selectApp(PAPER_GROUP_ID);
  }

  function selectTodoView(view) {
    setTodoView(view);
    selectApp(TODO_GROUP_ID);
  }

  function goHome() {
    if (windowActionPending) return;
    setWindowError('');
    setOpenMenu(null);
    setActiveApp(null);
    if (typeof document !== 'undefined') {
      document.title = 'WebView App';
      window.scrollTo?.(0, 0);
    }
  }

  async function runWindowAction(fn, onDone) {
    if (windowActionPending) return;
    setWindowActionPending(true);
    setWindowError('');
    try {
      await fn();
      onDone?.();
    } catch (error) {
      setWindowError(backendError(error));
    } finally {
      setWindowActionPending(false);
    }
  }

  const minimizeWindow = () => runWindowAction(() => backend.minimizeWindow());
  const toggleMaximize = () =>
    runWindowAction(
      () =>
        windowMaximized ? backend.restoreWindow() : backend.maximizeWindow(),
      () => setWindowMaximized((value) => !value)
    );
  const closeWindow = () => runWindowAction(() => backend.closeWindow());

  const sideBar = (
    <>
      <nav
        {...stylex.props(styles.sidebar, styles.responsiveSidebar)}
        aria-label="Primary"
      >
        <button
          type="button"
          {...stylex.props(
            styles.tab,
            styles.tabHover,
            activeApp === null && styles.tabActive,
            activeApp === null && styles.tabActiveBar
          )}
          onClick={goHome}
          aria-current={activeApp === null ? 'page' : undefined}
        >
          <span {...stylex.props(styles.tabGlyph)} aria-hidden="true">
            ⌂
          </span>
          <span {...stylex.props(styles.tabLabel)}>Home</span>
        </button>
        {topLevelPlugins.map((app) => (
          <button
            type="button"
            key={app.id}
            {...stylex.props(
              styles.tab,
              styles.tabHover,
              activeApp === app.id && styles.tabActive,
              activeApp === app.id && styles.tabActiveBar
            )}
            onClick={() => selectApp(app.id)}
            aria-current={activeApp === app.id ? 'page' : undefined}
          >
            <span {...stylex.props(styles.tabGlyph)} aria-hidden="true">
              {TAB_GLYPH[app.id] ?? '•'}
            </span>
            <span {...stylex.props(styles.tabLabel)}>
              {TAB_SHORT[app.id] ?? app.title}
            </span>
            {openedApps.includes(app.id) && (
              <span {...stylex.props(styles.tabDot)} aria-hidden="true" />
            )}
          </button>
        ))}
        <div {...stylex.props(styles.tabGroup)}>
          <button
            type="button"
            {...stylex.props(
              styles.tab,
              styles.tabHover,
              todoActive && styles.tabActive,
              todoActive && styles.tabActiveBar
            )}
            onClick={() =>
              todoActive ? toggleMenu('todos') : selectTodoView('list')
            }
            aria-expanded={showTodoMenu}
            aria-controls="todos-panel"
          >
            <span {...stylex.props(styles.tabGlyph)} aria-hidden="true">
              {TAB_GLYPH.todos}
            </span>
            <span {...stylex.props(styles.tabLabel)}>Todos</span>
            <span {...stylex.props(styles.submenuChevron)} aria-hidden="true">
              {showTodoMenu ? '▴' : '▾'}
            </span>
          </button>
        </div>
        <div {...stylex.props(styles.tabGroup)}>
          <button
            type="button"
            {...stylex.props(
              styles.tab,
              styles.tabHover,
              paperActive && styles.tabActive,
              paperActive && styles.tabActiveBar
            )}
            onClick={() =>
              paperActive ? toggleMenu('paper') : selectPaperView('reader')
            }
            aria-expanded={showPaperMenu}
            aria-controls="paper-panel"
          >
            <span {...stylex.props(styles.tabGlyph)} aria-hidden="true">
              {TAB_GLYPH.paper}
            </span>
            <span {...stylex.props(styles.tabLabel)}>Paper</span>
            <span {...stylex.props(styles.submenuChevron)} aria-hidden="true">
              {showPaperMenu ? '▴' : '▾'}
            </span>
          </button>
        </div>
        <div {...stylex.props(styles.tabGroup)}>
          <button
            type="button"
            {...stylex.props(
              styles.tab,
              styles.tabHover,
              quizActive && styles.tabActive,
              quizActive && styles.tabActiveBar
            )}
            onClick={() =>
              quizActive ? toggleMenu('quiz') : selectQuizView('session')
            }
            aria-expanded={showQuizMenu}
            aria-controls="quiz-panel"
          >
            <span {...stylex.props(styles.tabGlyph)} aria-hidden="true">
              {TAB_GLYPH.quiz}
            </span>
            <span {...stylex.props(styles.tabLabel)}>Quiz</span>
            <span {...stylex.props(styles.submenuChevron)} aria-hidden="true">
              {showQuizMenu ? '▴' : '▾'}
            </span>
          </button>
        </div>
        <div {...stylex.props(styles.tabGroup)}>
          <button
            type="button"
            {...stylex.props(
              styles.tab,
              styles.tabHover,
              toolsActive && styles.tabActive,
              toolsActive && styles.tabActiveBar
            )}
            onClick={() => toggleMenu('tools')}
            aria-expanded={showToolsMenu}
            aria-controls="tools-panel"
          >
            <span {...stylex.props(styles.tabGlyph)} aria-hidden="true">
              ◈
            </span>
            <span {...stylex.props(styles.tabLabel)}>Tools</span>
            <span {...stylex.props(styles.submenuChevron)} aria-hidden="true">
              {showToolsMenu ? '▴' : '▾'}
            </span>
          </button>
        </div>
      </nav>
      {showToolsMenu && (
        <aside
          {...stylex.props(styles.sidebarPanel, styles.responsiveSidebarPanel)}
          id="tools-panel"
          aria-label="Tools submenu"
        >
          <p {...stylex.props(styles.panelEyebrow)}>Menu</p>
          <h2 {...stylex.props(styles.panelTitle)}>Tools</h2>
          <div {...stylex.props(styles.panelList)}>
            {toolsPlugins.map((app) => (
              <button
                type="button"
                key={app.id}
                {...stylex.props(
                  styles.panelRow,
                  styles.panelRowHover,
                  activeApp === app.id && styles.panelRowActive
                )}
                onClick={() => selectApp(app.id)}
                aria-current={activeApp === app.id ? 'page' : undefined}
              >
                <span {...stylex.props(styles.rowGlyph)} aria-hidden="true">
                  {TAB_GLYPH[app.id] ?? '•'}
                </span>
                <span {...stylex.props(styles.rowCopy)}>
                  <strong {...stylex.props(styles.rowCopyStrong)}>
                    {app.title}
                  </strong>
                  <small {...stylex.props(styles.rowCopySmall)}>
                    {app.description}
                  </small>
                </span>
                <span {...stylex.props(styles.rowChevron)} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
      {showQuizMenu && (
        <aside
          {...stylex.props(styles.sidebarPanel, styles.responsiveSidebarPanel)}
          id="quiz-panel"
          aria-label="Quiz submenu"
        >
          <p {...stylex.props(styles.panelEyebrow)}>Knowledge deck</p>
          <h2 {...stylex.props(styles.panelTitle)}>Quiz</h2>
          <div {...stylex.props(styles.panelList)}>
            {QUIZ_MENU_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                {...stylex.props(
                  styles.panelRow,
                  styles.panelRowHover,
                  quizView === item.id && quizActive && styles.panelRowActive
                )}
                onClick={() => selectQuizView(item.id)}
                aria-current={
                  quizView === item.id && quizActive ? 'page' : undefined
                }
              >
                <span {...stylex.props(styles.rowGlyph)} aria-hidden="true">
                  {item.id === 'editor' ? '+' : '>'}
                </span>
                <span {...stylex.props(styles.rowCopy)}>
                  <strong {...stylex.props(styles.rowCopyStrong)}>
                    {item.title}
                  </strong>
                  <small {...stylex.props(styles.rowCopySmall)}>
                    {item.description}
                  </small>
                </span>
                <span {...stylex.props(styles.rowChevron)} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
      {showPaperMenu && (
        <aside
          {...stylex.props(styles.sidebarPanel, styles.responsiveSidebarPanel)}
          id="paper-panel"
          aria-label="Paper submenu"
        >
          <p {...stylex.props(styles.panelEyebrow)}>Research desk</p>
          <h2 {...stylex.props(styles.panelTitle)}>Academic Paper</h2>
          <div {...stylex.props(styles.panelList)}>
            {PAPER_MENU_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                {...stylex.props(
                  styles.panelRow,
                  styles.panelRowHover,
                  paperView === item.id && styles.panelRowActive
                )}
                onClick={() => selectPaperView(item.id)}
                aria-current={paperView === item.id ? 'page' : undefined}
              >
                <span {...stylex.props(styles.rowGlyph)} aria-hidden="true">
                  {item.id === 'reader'
                    ? '>'
                    : item.id === 'references'
                      ? '#'
                      : '▧'}
                </span>
                <span {...stylex.props(styles.rowCopy)}>
                  <strong {...stylex.props(styles.rowCopyStrong)}>
                    {item.title}
                  </strong>
                  <small {...stylex.props(styles.rowCopySmall)}>
                    {item.description}
                  </small>
                </span>
                <span {...stylex.props(styles.rowChevron)} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
      {showTodoMenu && (
        <aside
          {...stylex.props(styles.sidebarPanel, styles.responsiveSidebarPanel)}
          id="todos-panel"
          aria-label="Todos submenu"
        >
          <p {...stylex.props(styles.panelEyebrow)}>Keep it light</p>
          <h2 {...stylex.props(styles.panelTitle)}>Todos</h2>
          <div {...stylex.props(styles.panelList)}>
            {TODO_MENU_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                {...stylex.props(
                  styles.compactPanelRow,
                  todoView === item.id && styles.compactPanelRowActive
                )}
                onClick={() => selectTodoView(item.id)}
                aria-current={todoView === item.id ? 'page' : undefined}
              >
                <span
                  {...stylex.props(styles.compactPanelGlyph)}
                  aria-hidden="true"
                >
                  {item.id === 'calendar' ? '▦' : '✓'}
                </span>
                <span {...stylex.props(styles.rowCopy)}>
                  <strong {...stylex.props(styles.rowCopyStrong)}>
                    {item.title}
                  </strong>
                  <small {...stylex.props(styles.rowCopySmall)}>
                    {item.description}
                  </small>
                </span>
                <span {...stylex.props(styles.rowChevron)} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </>
  );

  if (activeApp === null) {
    return (
      <div
        {...stylex.props(
          styles.shell,
          styles.responsiveShell,
          (showToolsMenu || showQuizMenu || showPaperMenu || showTodoMenu) &&
            styles.shellPanel,
          (showToolsMenu || showQuizMenu || showPaperMenu || showTodoMenu) &&
            styles.responsivePanelShell
        )}
      >
        <header {...stylex.props(styles.topbar)}>
          <span {...stylex.props(styles.brandMark)}>WV</span>
          <span {...stylex.props(styles.brandName)}>WebView</span>
          <span {...stylex.props(styles.topbarStatus)}>
            <span {...stylex.props(styles.statusDot)} aria-hidden="true" />
            <span>{isNative ? 'Native' : 'Mock'}</span>
          </span>
        </header>

        <main {...stylex.props(styles.launcherMain)}>
          <div {...stylex.props(styles.launcherHead)}>
            <p {...stylex.props(styles.eyebrow)}>Toolkit</p>
            <h1 {...stylex.props(styles.pageTitle)}>Tools</h1>
            <p {...stylex.props(styles.lede)}>
              {frontendPlugins.length} small utilities. Pick one to start.
            </p>
          </div>

          {windowError && (
            <p {...stylex.props(styles.error)} role="alert">
              {windowError}
            </p>
          )}

          <nav
            {...stylex.props(styles.toolList, styles.responsiveToolList)}
            aria-label="Available tools"
          >
            {frontendPlugins.map((app) => (
              <button
                type="button"
                key={app.id}
                {...stylex.props(styles.toolRow, styles.toolRowHover)}
                onClick={() => selectApp(app.id)}
              >
                <span {...stylex.props(styles.rowGlyph)} aria-hidden="true">
                  {TAB_GLYPH[app.id] ?? '•'}
                </span>
                <span {...stylex.props(styles.rowCopy)}>
                  <strong {...stylex.props(styles.rowCopyStrong)}>
                    {app.title}
                  </strong>
                  <small {...stylex.props(styles.rowCopySmall)}>
                    {app.description}
                  </small>
                </span>
                <span {...stylex.props(styles.rowChevron)} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </nav>

          <div>
            <BackendStatus compact />
          </div>
        </main>

        {sideBar}
      </div>
    );
  }

  return (
    <div
      {...stylex.props(
        styles.shell,
        styles.responsiveShell,
        (showToolsMenu || showQuizMenu || showPaperMenu || showTodoMenu) &&
          styles.shellPanel,
        (showToolsMenu || showQuizMenu || showPaperMenu || showTodoMenu) &&
          styles.responsivePanelShell
      )}
    >
      <header {...stylex.props(styles.topbar)}>
        <button
          type="button"
          {...stylex.props(styles.backButton)}
          onClick={goHome}
          aria-label="Back to tools"
        >
          <span aria-hidden="true">‹</span>
          <span {...stylex.props(styles.backLabel)}>Tools</span>
        </button>
        <div {...stylex.props(styles.titlebarName)}>
          <span {...stylex.props(styles.titlebarDot)} aria-hidden="true" />
          <strong>{currentApp.title}</strong>
        </div>
        {isNative ? (
          <div {...stylex.props(styles.windowActions)}>
            <button
              type="button"
              {...stylex.props(styles.windowAction, styles.windowActionHover)}
              onClick={minimizeWindow}
              disabled={windowActionPending}
              aria-label="Minimize window"
            >
              –
            </button>
            <button
              type="button"
              {...stylex.props(styles.windowAction, styles.windowActionHover)}
              onClick={toggleMaximize}
              disabled={windowActionPending}
              aria-label={
                windowMaximized ? 'Restore window' : 'Maximize window'
              }
            >
              {windowMaximized ? '❐' : '□'}
            </button>
            <button
              type="button"
              {...stylex.props(styles.windowAction, styles.closeHover)}
              onClick={closeWindow}
              disabled={windowActionPending}
              aria-label="Close window"
            >
              ×
            </button>
          </div>
        ) : (
          <span {...stylex.props(styles.topbarStatus)}>
            <span {...stylex.props(styles.statusDot)} aria-hidden="true" />
            <span>Mock</span>
          </span>
        )}
      </header>

      {windowError && (
        <p {...stylex.props(styles.error)} role="alert">
          {windowError}
        </p>
      )}

      {openedWorkspaces.length > 1 && (
        <section
          {...stylex.props(styles.chipStrip)}
          aria-label="Recently opened"
        >
          {openedWorkspaces
            .filter((app) => app.id !== activeApp)
            .map((app) => (
              <button
                type="button"
                key={app.id}
                {...stylex.props(styles.chip)}
                onClick={() => selectApp(app.id)}
              >
                {TAB_SHORT[app.id] ?? app.title}
              </button>
            ))}
        </section>
      )}

      <main {...stylex.props(styles.workspaceBody)}>
        <ErrorBoundary key={activeApp} onReset={goHome}>
          <ActivePlugin
            quizView={activeApp === QUIZ_GROUP_ID ? quizView : undefined}
            paperView={activeApp === PAPER_GROUP_ID ? paperView : undefined}
            todoView={activeApp === TODO_GROUP_ID ? todoView : undefined}
          />
        </ErrorBoundary>
      </main>

      {sideBar}
    </div>
  );
}
