import * as stylex from '@stylexjs/stylex';

export { stylex };

export const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    paddingLeft: 76,
    backgroundColor: '#111214',
    color: '#f2f3f5',
    fontSize: 15,
    lineHeight: 1.5
  },
  shellPanel: {
    paddingLeft: 324
  },
  topbar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingLeft: 14,
    paddingRight: 14,
    borderBottom: '1px solid rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(17,18,20,0.92)',
    backdropFilter: 'blur(12px)'
  },
  brandMark: {
    display: 'grid',
    placeItems: 'center',
    width: 30,
    height: 30,
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    color: '#f7c66b',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.08em'
  },
  brandName: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '-0.01em'
  },
  topbarStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
    color: '#9b9ea8',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 10,
    letterSpacing: '0.06em',
    textTransform: 'uppercase'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#82c99b',
    boxShadow: '0 0 0 3px rgba(130,201,155,0.12)'
  },
  windowActions: {
    display: 'flex',
    gap: 2,
    marginLeft: 'auto'
  },
  windowAction: {
    minWidth: 40,
    minHeight: 36,
    padding: '6px 8px',
    borderRadius: 7,
    backgroundColor: 'transparent',
    color: '#9b9ea8',
    fontSize: 14
  },
  windowActionHover: {
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#f2f3f5'
    }
  },
  closeHover: {
    ':hover': {
      backgroundColor: '#b54d4d',
      color: '#fff'
    }
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 2,
    width: 76,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    borderRight: '1px solid rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(17,18,20,0.96)',
    backdropFilter: 'blur(12px)',
    overflowY: 'auto'
  },
  tab: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
    minHeight: 56,
    padding: '7px 4px',
    backgroundColor: 'transparent',
    color: '#9b9ea8',
    fontSize: 15
  },
  tabHover: {
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#f2f3f5'
    }
  },
  tabActive: {
    color: '#f2f3f5'
  },
  tabActiveBar: {
    '::before': {
      position: 'absolute',
      top: 12,
      bottom: 12,
      left: 0,
      width: 2,
      borderRadius: 2,
      backgroundColor: '#f7c66b',
      content: '""'
    }
  },
  tabGlyph: {
    fontSize: 17,
    lineHeight: 1
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },
  tabDot: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 5,
    height: 5,
    borderRadius: '50%',
    backgroundColor: '#f7c66b'
  },
  tabGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 4,
    paddingTop: 6,
    borderTop: '1px solid rgba(255,255,255,0.09)'
  },
  submenuChevron: {
    color: '#9b9ea8',
    fontSize: 10,
    lineHeight: 1
  },
  sidebarPanel: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 76,
    zIndex: 19,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: 248,
    padding:
      'calc(16px + env(safe-area-inset-top, 0px)) 13px calc(16px + env(safe-area-inset-bottom, 0px))',
    borderRight: '1px solid rgba(255,255,255,0.09)',
    backgroundColor: '#191a1e',
    overflowY: 'auto'
  },
  panelEyebrow: {
    margin: 0,
    color: '#9b9ea8',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase'
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 650,
    letterSpacing: '-0.02em'
  },
  panelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  panelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    width: '100%',
    minHeight: 60,
    padding: 11,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    backgroundColor: '#202226',
    color: '#f2f3f5',
    textAlign: 'left'
  },
  panelRowHover: {
    ':hover': {
      borderColor: '#f7c66b'
    }
  },
  panelRowActive: {
    borderColor: '#f7c66b'
  },
  compactPanelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minHeight: 46,
    padding: '7px 8px',
    border: '1px solid transparent',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.025)',
    color: '#f2f3f5',
    textAlign: 'left',
    ':hover': {
      borderColor: 'rgba(247,198,107,0.5)',
      backgroundColor: 'rgba(255,255,255,0.06)'
    }
  },
  compactPanelRowActive: {
    borderColor: '#f7c66b',
    backgroundColor: 'rgba(247,198,107,0.08)'
  },
  compactPanelGlyph: {
    display: 'grid',
    flex: '0 0 28px',
    placeItems: 'center',
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(247,198,107,0.12)',
    color: '#f7c66b',
    fontSize: 13,
    fontWeight: 800
  },
  rowGlyph: {
    display: 'grid',
    flex: '0 0 38px',
    placeItems: 'center',
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#f7c66b',
    fontSize: 16
  },
  rowCopy: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 2,
    minWidth: 0
  },
  rowCopyStrong: {
    fontSize: 15,
    letterSpacing: '-0.01em'
  },
  rowCopySmall: {
    display: '-webkit-box',
    overflow: 'hidden',
    color: '#9b9ea8',
    fontSize: 12,
    lineHeight: 1.4,
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2
  },
  rowChevron: {
    marginLeft: 'auto',
    color: '#f7c66b',
    fontSize: 22,
    lineHeight: 1
  },
  launcherMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: 992,
    margin: '0 auto',
    padding: '20px 16px 32px'
  },
  launcherHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  eyebrow: {
    margin: 0,
    color: '#9b9ea8',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase'
  },
  pageTitle: {
    margin: 0,
    fontSize: 'clamp(30px, 5vw, 51px)',
    fontWeight: 650,
    letterSpacing: '-0.05em',
    lineHeight: 1
  },
  lede: {
    maxWidth: 448,
    margin: 0,
    color: '#9b9ea8',
    fontSize: 14,
    lineHeight: 1.55
  },
  toolList: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 10
  },
  toolRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    width: '100%',
    minHeight: 68,
    padding: '13px 14px',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    backgroundColor: '#202226',
    color: '#f2f3f5',
    textAlign: 'left'
  },
  toolRowHover: {
    ':hover': {
      borderColor: '#f7c66b',
      backgroundColor: '#25272c'
    }
  },
  workspaceBody: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 16px 32px'
  },
  toolPage: {
    display: 'flex',
    flexDirection: 'column',
    gap: 13,
    width: '100%',
    maxWidth: 704
  },
  toolHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4
  },
  headingTitle: {
    margin: '5px 0 0',
    fontSize: 'clamp(30px, 8vw, 42px)',
    fontWeight: 650,
    letterSpacing: '-0.05em',
    lineHeight: 1
  },
  headingText: {
    margin: '8px 0 0',
    color: '#9b9ea8',
    fontSize: 14,
    lineHeight: 1.55
  },
  mockBadge: {
    alignSelf: 'flex-start',
    padding: '6px 10px',
    border: '1px solid rgba(247,198,107,0.35)',
    borderRadius: 100,
    color: '#f7c66b',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap'
  },
  toolPanel: {
    padding: 16,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    backgroundColor: '#202226'
  },
  panelHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16
  },
  panelLabel: {
    color: '#9b9ea8',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase'
  },
  panelHeadingTitle: {
    margin: '4px 0 0',
    fontSize: 17,
    fontWeight: 650,
    letterSpacing: '-0.02em'
  },
  panelStatus: {
    padding: '3px 0',
    color: '#82c99b',
    fontSize: 10,
    whiteSpace: 'nowrap'
  },
  panelNote: {
    margin: '12px 0 0',
    color: '#9b9ea8',
    fontSize: 12,
    lineHeight: 1.5
  },
  primaryButton: {
    width: '100%',
    minHeight: 46,
    padding: '11px 16px',
    borderRadius: 9,
    backgroundColor: '#d2644e',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    ':hover': {
      backgroundColor: '#e47c62'
    }
  },
  secondaryButton: {
    width: '100%',
    minHeight: 46,
    padding: '11px 16px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 9,
    backgroundColor: 'transparent',
    color: '#9b9ea8',
    fontSize: 14,
    fontWeight: 700,
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.06)',
      color: '#f2f3f5'
    }
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    padding: '4px 6px',
    borderRadius: 7,
    backgroundColor: 'transparent',
    color: '#9b9ea8',
    fontSize: 20,
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#f2f3f5'
    }
  },
  backLabel: {
    fontSize: 12,
    fontWeight: 700
  },
  titlebarName: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    overflow: 'hidden',
    fontSize: 14,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  titlebarDot: {
    width: 8,
    height: 8,
    flex: '0 0 8px',
    borderRadius: '50%',
    backgroundColor: '#f7c66b'
  },
  chipStrip: {
    display: 'flex',
    gap: 6,
    width: '100%',
    maxWidth: 704,
    margin: '0 auto',
    padding: '10px 16px 0',
    overflowX: 'auto'
  },
  chip: {
    flex: '0 0 auto',
    minHeight: 32,
    padding: '5px 11px',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 100,
    backgroundColor: '#202226',
    color: '#f2f3f5',
    fontSize: 12,
    fontWeight: 600
  },
  error: {
    margin: 0,
    color: '#ffb3bf',
    fontSize: 13
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0
  },
  errorPanel: {
    width: '100%',
    maxWidth: 704
  },
  statusActions: {
    display: 'flex',
    gap: 6,
    width: '100%',
    marginTop: 12
  },
  statusAction: {
    flex: 1,
    minHeight: 40,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#191a1e',
    color: '#f2f3f5',
    fontSize: 12,
    fontWeight: 700
  },
  statusCard: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    padding: 13,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10,
    backgroundColor: '#202226',
    color: '#9b9ea8',
    fontSize: 12
  },
  statusLabel: {
    color: '#f2f3f5',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  statusValue: {
    flex: '1 1 100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  statusError: {
    width: '100%',
    color: '#ffb3bf'
  },
  gridSingle: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 13
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 13
  },
  selectLabel: {
    display: 'block',
    marginBottom: 5,
    color: '#9b9ea8',
    fontSize: 12
  },
  select: {
    width: '100%',
    minHeight: 44,
    padding: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    outline: 0,
    backgroundColor: '#191a1e',
    color: '#f2f3f5',
    fontSize: 14
  },
  volumeSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16
  },
  volumeCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  mutedSmall: {
    color: '#9b9ea8',
    fontSize: 12
  },
  progressTrack: {
    height: 6,
    margin: '13px 0 16px',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  progressFill: {
    display: 'block',
    height: '100%',
    borderRadius: 'inherit',
    backgroundColor: '#f06b4f'
  },
  folderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  folderCopy: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
    color: '#9b9ea8',
    fontSize: 13
  },
  folderTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  folderFill: {
    display: 'block',
    height: '100%',
    borderRadius: 'inherit',
    backgroundColor: '#f06b4f'
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    paddingTop: 13,
    borderTop: '1px solid rgba(255,255,255,0.09)',
    color: '#9b9ea8',
    fontSize: 12
  },
  trackMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  albumArt: {
    display: 'grid',
    placeItems: 'center',
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#2a3038',
    color: '#77a6d8',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 12,
    fontWeight: 800
  },
  trackTitle: {
    margin: '4px 0 0',
    fontSize: 17
  },
  toggle: {
    minHeight: 40,
    marginLeft: 'auto',
    padding: '7px 11px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 100,
    backgroundColor: 'transparent',
    color: '#9b9ea8',
    fontSize: 12,
    fontWeight: 700
  },
  toggleEnabled: {
    borderColor: '#77a6d8',
    color: '#77a6d8'
  },
  visualizer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: 92,
    marginTop: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#191a1e'
  },
  visualizerBar: {
    flex: 1,
    minWidth: 2,
    borderRadius: 3,
    backgroundColor: '#77a6d8'
  },
  visualizerAccent: {
    backgroundColor: '#f7c66b'
  },
  transportRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    color: '#9b9ea8',
    fontSize: 11
  },
  transportTrack: {
    flex: 1,
    height: 5,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  transportFill: {
    display: 'block',
    width: '34%',
    height: '100%',
    borderRadius: 'inherit',
    backgroundColor: '#77a6d8'
  },
  bands: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 190
  },
  band: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    minWidth: 0
  },
  bandInput: {
    width: 160,
    height: 24,
    marginTop: 70,
    transform: 'rotate(-90deg)',
    accentColor: '#77a6d8'
  },
  bandValue: {
    color: '#f2f3f5',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 11
  },
  bandLabel: {
    color: '#9b9ea8',
    fontSize: 11
  },
  presetList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginTop: 13
  },
  presetButton: {
    minHeight: 46,
    padding: 10,
    border: '1px solid transparent',
    borderRadius: 8,
    backgroundColor: '#191a1e',
    color: '#9b9ea8',
    fontSize: 13,
    fontWeight: 600
  },
  presetActive: {
    borderColor: '#77a6d8',
    color: '#f2f3f5'
  },
  notesLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 13
  },
  notesListHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 13
  },
  newNoteButton: {
    minHeight: 40,
    padding: '7px 11px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#f7c66b',
    fontSize: 12,
    fontWeight: 700
  },
  searchInput: {
    width: '100%',
    minHeight: 42,
    marginBottom: 10,
    padding: '8px 10px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    outline: 0,
    backgroundColor: '#191a1e',
    color: '#f2f3f5',
    fontSize: 13
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    overflow: 'auto'
  },
  noteListItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    width: '100%',
    padding: 10,
    border: '1px solid transparent',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#f2f3f5',
    textAlign: 'left',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)'
    }
  },
  noteListActive: {
    borderColor: '#f7c66b',
    backgroundColor: 'rgba(247,198,107,0.08)'
  },
  noteMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    color: '#9b9ea8',
    fontSize: 10,
    textTransform: 'uppercase'
  },
  notePreview: {
    width: '100%',
    overflow: 'hidden',
    color: '#9b9ea8',
    fontSize: 12,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  emptyNotes: {
    padding: 16,
    color: '#9b9ea8',
    textAlign: 'center',
    fontSize: 13
  },
  noteEditorHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 13
  },
  pdfActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6
  },
  printButton: {
    minHeight: 40,
    padding: '7px 11px',
    border: '1px solid rgba(130,201,155,0.4)',
    borderRadius: 8,
    backgroundColor: 'rgba(130,201,155,0.08)',
    color: '#82c99b',
    fontSize: 12,
    fontWeight: 700
  },
  noteSaved: {
    display: 'block',
    marginTop: 3,
    color: '#82c99b',
    fontSize: 11
  },
  exportButton: {
    minHeight: 40,
    padding: '7px 11px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#f7c66b',
    fontSize: 12,
    fontWeight: 700
  },
  noteTitleInput: {
    width: '100%',
    padding: '7px 0',
    border: 0,
    outline: 0,
    backgroundColor: 'transparent',
    color: '#f2f3f5',
    fontSize: 23,
    fontWeight: 650
  },
  noteMetaRow: {
    padding: '4px 0 10px',
    borderBottom: '1px solid rgba(255,255,255,0.09)',
    color: '#9b9ea8',
    fontSize: 11
  },
  noteBodyInput: {
    width: '100%',
    minHeight: 360,
    marginTop: 13,
    padding: 0,
    border: 0,
    outline: 0,
    backgroundColor: 'transparent',
    color: '#f2f3f5',
    fontSize: 14,
    lineHeight: 1.7,
    resize: 'vertical'
  },
  noteQuestionInput: {
    minHeight: 92,
    marginTop: 4
  },
  noteAnswerInput: {
    minHeight: 260,
    marginTop: 4
  },
  noteEditorFooter: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
    paddingTop: 13,
    borderTop: '1px solid rgba(255,255,255,0.09)',
    color: '#9b9ea8',
    fontSize: 11
  },
  noteActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  textButton: {
    minHeight: 40,
    padding: 0,
    backgroundColor: 'transparent',
    color: '#f7c66b',
    fontSize: 12,
    fontWeight: 700
  },
  todoShell: {
    minHeight: '100dvh',
    padding: '24px 16px 40px',
    backgroundColor: '#e9f2df',
    color: '#123c32'
  },
  todoContainer: {
    width: '100%',
    maxWidth: 576,
    margin: '0 auto'
  },
  todoHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16
  },
  todoEyebrow: {
    margin: '0 0 4px',
    color: '#d2644e',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase'
  },
  todoTitle: {
    margin: 0,
    color: '#123c32',
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: '-0.06em',
    lineHeight: 1
  },
  todoLead: {
    maxWidth: 160,
    margin: 0,
    paddingBottom: 4,
    color: 'rgba(18,60,50,0.6)',
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: 'right'
  },
  todoCard: {
    overflow: 'hidden',
    border: '1px solid rgba(18,60,50,0.1)',
    borderRadius: 24,
    backgroundColor: '#fff',
    boxShadow: '0 12px 40px rgba(20,66,54,0.14)'
  },
  todoStorageError: {
    padding: '8px 16px',
    borderBottom: '1px solid #f0d6a0',
    backgroundColor: '#fff5dc',
    color: '#875c14',
    fontSize: 12
  },
  newTodoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(18,60,50,0.1)'
  },
  toggleAll: {
    flex: '0 0 auto',
    minHeight: 40,
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: 'rgba(18,60,50,0.3)',
    fontSize: 24,
    lineHeight: 1
  },
  todoInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    border: 0,
    outline: 0,
    backgroundColor: 'transparent',
    color: '#123c32',
    fontSize: 16
  },
  todoDateInput: {
    flex: '0 0 auto',
    width: 122,
    minHeight: 32,
    padding: '5px 7px',
    border: '1px solid rgba(18,60,50,0.12)',
    borderRadius: 6,
    outline: 0,
    backgroundColor: '#f8fbf4',
    color: 'rgba(18,60,50,0.7)',
    fontSize: 11
  },
  todoItem: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(18,60,50,0.1)'
  },
  todoList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  todoView: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  todoCheckbox: {
    flex: '0 0 24px',
    width: 24,
    height: 24,
    margin: 0,
    appearance: 'none',
    border: '2px solid rgba(18,60,50,0.2)',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    accentColor: '#2f8060'
  },
  todoCheckboxChecked: {
    borderColor: '#2f8060',
    backgroundColor: '#2f8060'
  },
  todoLabel: {
    flex: 1,
    minWidth: 0,
    color: '#123c32',
    cursor: 'text',
    fontSize: 16,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  todoLabelChecked: {
    color: 'rgba(18,60,50,0.35)',
    textDecorationLine: 'line-through'
  },
  destroy: {
    flex: '0 0 auto',
    minHeight: 40,
    padding: '4px 8px',
    borderRadius: 100,
    backgroundColor: 'transparent',
    color: 'rgba(18,60,50,0.3)',
    fontSize: 20,
    lineHeight: 1,
    ':hover': {
      backgroundColor: '#ffe8e4',
      color: '#d94e4e'
    }
  },
  todoEdit: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #a3d72e',
    borderRadius: 12,
    outline: 0,
    backgroundColor: '#f1fbdc',
    color: '#123c32',
    fontSize: 18
  },
  todoFooter: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    color: 'rgba(18,60,50,0.6)',
    fontSize: 14
  },
  todoCount: {
    marginRight: 'auto'
  },
  todoStrong: {
    color: '#123c32',
    fontWeight: 700
  },
  filterNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  filterButton: {
    minHeight: 36,
    padding: '6px 12px',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#123c32',
    fontSize: 13,
    fontWeight: 600
  },
  filterActive: {
    backgroundColor: '#eef9c9'
  },
  clearButton: {
    minHeight: 36,
    padding: '6px 8px',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: 'rgba(18,60,50,0.6)',
    fontSize: 13,
    fontWeight: 600,
    ':hover': {
      backgroundColor: '#ffe8e4',
      color: '#d94e4e'
    }
  },
  emptyTodo: {
    padding: '40px 20px',
    borderBottom: '1px solid rgba(18,60,50,0.1)',
    color: 'rgba(18,60,50,0.5)',
    textAlign: 'center'
  },
  todoHint: {
    margin: '16px 0 0',
    color: 'rgba(18,60,50,0.4)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  todoCalendar: {
    width: '100%',
    maxWidth: 820,
    margin: '0 auto',
    padding: 18,
    border: '1px solid rgba(18,60,50,0.1)',
    borderRadius: 20,
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 40px rgba(20,66,54,0.14)'
  },
  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16
  },
  calendarTitle: {
    margin: 0,
    color: '#123c32',
    fontSize: 25,
    letterSpacing: '-0.04em'
  },
  calendarControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  calendarArrow: {
    display: 'grid',
    placeItems: 'center',
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#123c32',
    fontSize: 21,
    ':hover': {
      backgroundColor: '#eef9c9'
    }
  },
  calendarToday: {
    minHeight: 32,
    padding: '5px 8px',
    borderRadius: 7,
    backgroundColor: '#eef9c9',
    color: '#123c32',
    fontSize: 11,
    fontWeight: 700
  },
  calendarWeekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 5,
    marginBottom: 5,
    color: 'rgba(18,60,50,0.46)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 5
  },
  calendarDay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 68,
    padding: 7,
    border: '1px solid rgba(18,60,50,0.1)',
    borderRadius: 8,
    backgroundColor: '#fbfdf9',
    color: '#123c32',
    fontSize: 12,
    textAlign: 'left',
    ':hover': {
      borderColor: '#a3d72e',
      backgroundColor: '#f1fbdc'
    }
  },
  calendarDayOutside: {
    opacity: 0.38
  },
  calendarDaySelected: {
    borderColor: '#123c32',
    backgroundColor: '#123c32',
    color: '#ffffff'
  },
  calendarDayToday: {
    borderColor: '#d2644e',
    boxShadow: 'inset 0 0 0 1px #d2644e'
  },
  calendarDayCount: {
    alignSelf: 'flex-end',
    display: 'grid',
    placeItems: 'center',
    minWidth: 17,
    height: 17,
    padding: '0 4px',
    borderRadius: 9,
    backgroundColor: '#a3d72e',
    color: '#123c32',
    fontSize: 9,
    fontWeight: 800
  },
  calendarDayHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1px solid rgba(18,60,50,0.1)',
    color: 'rgba(18,60,50,0.58)',
    fontSize: 11
  },
  calendarDayHeaderTitle: {
    margin: 0,
    color: '#123c32',
    fontSize: 17
  },
  calendarAddForm: {
    display: 'flex',
    gap: 7,
    marginTop: 12
  },
  calendarAddInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    padding: '7px 9px',
    border: '1px solid rgba(18,60,50,0.13)',
    borderRadius: 7,
    outline: 0,
    backgroundColor: '#fbfdf9',
    color: '#123c32',
    fontSize: 12
  },
  calendarAddButton: {
    minHeight: 38,
    padding: '7px 12px',
    borderRadius: 7,
    backgroundColor: '#a3d72e',
    color: '#123c32',
    fontSize: 11,
    fontWeight: 800
  },
  calendarTodoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    margin: '12px 0 0',
    padding: 0,
    listStyle: 'none'
  },
  calendarTodo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 9px',
    borderRadius: 7,
    backgroundColor: '#f1fbdc',
    color: '#123c32',
    fontSize: 12
  },
  calendarCheckbox: {
    width: 16,
    height: 16,
    margin: 0,
    accentColor: '#2f8060'
  },
  calendarTodoTitle: {
    flex: 1,
    minWidth: 0,
    overflowWrap: 'anywhere'
  },
  calendarTodoCompleted: {
    opacity: 0.48,
    textDecorationLine: 'line-through'
  },
  calendarDelete: {
    padding: '3px 5px',
    borderRadius: 5,
    backgroundColor: 'transparent',
    color: 'rgba(18,60,50,0.35)',
    fontSize: 16,
    lineHeight: 1,
    ':hover': {
      backgroundColor: '#ffe8e4',
      color: '#d94e4e'
    }
  },
  calendarEmpty: {
    margin: '12px 0 0',
    padding: '16px 9px',
    color: 'rgba(18,60,50,0.48)',
    fontSize: 12,
    textAlign: 'center'
  },
  academicPage: {
    width: '100%',
    maxWidth: 1240,
    margin: '0 auto',
    paddingBottom: 48
  },
  academicToolbar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 18
  },
  academicLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
    alignItems: 'start'
  },
  paperRail: {
    display: 'flex',
    flexDirection: 'column',
    gap: 22,
    minWidth: 0,
    padding: 15,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    backgroundColor: '#191a1e'
  },
  paperWorkspaceNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  paperWorkspaceButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    width: '100%',
    padding: '9px 10px',
    border: '1px solid transparent',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#f2f3f5',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'left',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)'
    }
  },
  paperWorkspaceButtonActive: {
    borderColor: '#77a6d8',
    backgroundColor: 'rgba(119,166,216,0.1)'
  },
  paperWorkspaceButtonMeta: {
    color: '#9b9ea8',
    fontSize: 10,
    fontWeight: 400
  },
  paperRailLabel: {
    margin: '0 0 9px',
    color: '#9b9ea8',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase'
  },
  paperLibrary: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  paperLibraryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    width: '100%',
    padding: 10,
    border: '1px solid transparent',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#f2f3f5',
    textAlign: 'left',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)'
    }
  },
  paperLibraryItemActive: {
    borderColor: '#77a6d8',
    backgroundColor: 'rgba(119,166,216,0.1)'
  },
  paperLibraryItemTitle: {
    fontSize: 12,
    lineHeight: 1.35
  },
  paperLibraryItemMeta: {
    color: '#9b9ea8',
    fontSize: 10
  },
  paperContents: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  paperContentsButton: {
    padding: '5px 7px',
    borderRadius: 5,
    backgroundColor: 'transparent',
    color: '#9b9ea8',
    fontSize: 12,
    textAlign: 'left',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#f2f3f5'
    }
  },
  paperStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 7,
    margin: 0,
    paddingTop: 15,
    borderTop: '1px solid rgba(255,255,255,0.09)'
  },
  paperStat: {
    minWidth: 0
  },
  paperStatLabel: {
    color: '#70737d',
    fontSize: 9,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  paperStatValue: {
    marginTop: 3,
    color: '#f2f3f5',
    fontSize: 12,
    fontWeight: 700
  },
  paperDocument: {
    minWidth: 0,
    padding: 'clamp(22px, 5vw, 58px)',
    border: '1px solid #d9d5cc',
    borderRadius: 3,
    backgroundColor: '#fbfaf7',
    color: '#292a2e',
    boxShadow: '0 16px 42px rgba(0,0,0,0.18)',
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 15,
    lineHeight: 1.65
  },
  paperHeader: {
    marginBottom: 30,
    textAlign: 'center'
  },
  paperKicker: {
    margin: '0 0 15px',
    color: '#856a26',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.15em',
    textTransform: 'uppercase'
  },
  paperTitle: {
    maxWidth: 780,
    margin: '0 auto 10px',
    fontSize: 'clamp(28px, 4vw, 46px)',
    lineHeight: 1.06,
    letterSpacing: '-0.035em'
  },
  paperSubtitle: {
    margin: '0 auto 15px',
    color: '#686a70',
    fontSize: 16,
    fontStyle: 'italic'
  },
  paperByline: {
    margin: 0,
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: 700
  },
  paperAffiliation: {
    margin: '4px 0 0',
    color: '#777981',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: 11
  },
  paperAbstract: {
    marginBottom: 28,
    padding: '16px 18px',
    borderTop: '2px solid #303136',
    borderBottom: '1px solid #d4d0c7',
    fontSize: 13,
    lineHeight: 1.55
  },
  paperAbstractHeading: {
    margin: '0 0 6px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  },
  paperAbstractText: {
    margin: 0
  },
  paperKeywords: {
    margin: '10px 0 0',
    color: '#777981',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: 11
  },
  paperColumns: {
    columnCount: 1,
    columnGap: 34
  },
  paperSection: {
    marginBottom: 23,
    breakInside: 'auto'
  },
  paperSectionTitle: {
    margin: '0 0 8px',
    color: '#303136',
    fontSize: 18,
    lineHeight: 1.2,
    breakAfter: 'avoid'
  },
  paperSectionParagraph: {
    margin: '0 0 12px',
    textAlign: 'justify',
    overflowWrap: 'anywhere'
  },
  paperSectionQuote: {
    margin: '15px 0',
    padding: '5px 0 5px 15px',
    borderLeft: '2px solid #c49b42',
    color: '#575960',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 1.45
  },
  paperSectionList: {
    margin: '0 0 13px',
    paddingLeft: 20
  },
  paperSectionListItem: {
    marginBottom: 5
  },
  paperCode: {
    margin: '15px 0',
    border: '1px solid #d4d5d6',
    borderRadius: 4,
    backgroundColor: '#f0f1f2',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    fontFamily: '"SFMono-Regular", Consolas, monospace'
  },
  paperCodeLabel: {
    padding: '5px 9px',
    borderBottom: '1px solid #d4d5d6',
    color: '#74767c',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  paperCodePre: {
    margin: 0,
    padding: 11,
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap'
  },
  paperCodeText: {
    fontSize: 11,
    lineHeight: 1.5
  },
  paperReferences: {
    marginTop: 9,
    paddingTop: 14,
    borderTop: '1px solid #d4d0c7',
    columnSpan: 'all'
  },
  paperReference: {
    display: 'grid',
    gridTemplateColumns: '32px 1fr',
    gap: 5,
    margin: '0 0 8px',
    fontSize: 12,
    lineHeight: 1.5
  },
  paperRailNote: {
    color: '#70737d',
    fontSize: 11,
    lineHeight: 1.45
  },
  managerPanel: {
    minWidth: 0,
    padding: 'clamp(20px, 4vw, 38px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    backgroundColor: '#191a1e'
  },
  submenuHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
    paddingBottom: 22,
    borderBottom: '1px solid rgba(255,255,255,0.09)'
  },
  submenuTitle: {
    margin: 0,
    color: '#f2f3f5',
    fontSize: 28,
    letterSpacing: '-0.03em'
  },
  submenuDescription: {
    maxWidth: 570,
    margin: '8px 0 0',
    color: '#9b9ea8',
    fontSize: 13,
    lineHeight: 1.55
  },
  submenuCount: {
    flex: '0 0 auto',
    padding: '7px 9px',
    borderRadius: 6,
    backgroundColor: 'rgba(119,166,216,0.12)',
    color: '#a9c9ed',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase'
  },
  managerLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 22,
    paddingTop: 22
  },
  managerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 15,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10,
    backgroundColor: '#202226'
  },
  managerLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    color: '#9b9ea8',
    fontSize: 11
  },
  managerInput: {
    width: '100%',
    minHeight: 38,
    padding: '7px 9px',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 6,
    outline: 0,
    backgroundColor: '#191a1e',
    color: '#f2f3f5',
    fontSize: 12
  },
  managerFormRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8
  },
  managerPrimaryButton: {
    minHeight: 40,
    marginTop: 4,
    padding: '7px 11px',
    borderRadius: 7,
    backgroundColor: '#f7c66b',
    color: '#24201a',
    fontSize: 12,
    fontWeight: 800,
    ':hover': {
      backgroundColor: '#ffda8c'
    }
  },
  managerListPanel: {
    minWidth: 0
  },
  managerListHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    color: '#f2f3f5',
    fontSize: 12
  },
  managerSearch: {
    width: 190,
    minHeight: 36,
    padding: '7px 9px',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 6,
    outline: 0,
    backgroundColor: '#202226',
    color: '#f2f3f5',
    fontSize: 12
  },
  referenceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7
  },
  referenceCard: {
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) auto',
    gap: 10,
    alignItems: 'start',
    padding: 12,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8,
    backgroundColor: '#202226'
  },
  referenceCardLabel: {
    color: '#f7c66b',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 11,
    fontWeight: 700
  },
  referenceCardBody: {
    minWidth: 0,
    color: '#f2f3f5',
    fontSize: 13
  },
  referenceCardText: {
    margin: '5px 0',
    color: '#9b9ea8',
    fontSize: 11,
    lineHeight: 1.5
  },
  referenceCardMeta: {
    color: '#70737d',
    fontSize: 10
  },
  referenceDelete: {
    padding: '4px 6px',
    borderRadius: 5,
    backgroundColor: 'transparent',
    color: '#9b9ea8',
    fontSize: 10,
    ':hover': {
      backgroundColor: 'rgba(181,77,77,0.14)',
      color: '#ed9999'
    }
  },
  emptyManager: {
    margin: 0,
    padding: 30,
    border: '1px dashed rgba(255,255,255,0.14)',
    borderRadius: 8,
    color: '#9b9ea8',
    textAlign: 'center',
    fontSize: 12
  },
  assetUploadButton: {
    position: 'relative',
    flex: '0 0 auto',
    minHeight: 38,
    padding: '9px 12px',
    border: '1px solid rgba(130,201,155,0.4)',
    borderRadius: 7,
    backgroundColor: 'rgba(130,201,155,0.08)',
    color: '#82c99b',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer'
  },
  assetFileInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none'
  },
  assetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: 12,
    paddingTop: 22
  },
  assetCard: {
    position: 'relative',
    minWidth: 0,
    margin: 0,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 9,
    backgroundColor: '#202226'
  },
  assetImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '4 / 3',
    objectFit: 'cover',
    backgroundColor: '#111214'
  },
  assetCaption: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 10,
    color: '#f2f3f5',
    fontSize: 12
  },
  assetCaptionText: {
    overflow: 'hidden',
    color: '#9b9ea8',
    fontSize: 10,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  assetEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 7,
    marginTop: 22,
    padding: '58px 20px',
    border: '1px dashed rgba(130,201,155,0.35)',
    borderRadius: 10,
    backgroundColor: 'rgba(130,201,155,0.04)',
    color: '#82c99b',
    textAlign: 'center',
    cursor: 'pointer'
  },
  assetEmptyText: {
    color: '#9b9ea8',
    fontSize: 11
  },
  focus: {
    ':focus-visible': {
      outline: '2px solid #f7c66b',
      outlineOffset: 2
    }
  },
  responsiveGrid: {
    '@media (min-width: 720px)': {
      gridTemplateColumns: '1fr 1fr'
    }
  },
  responsiveAcademicLayout: {
    '@media (min-width: 900px)': {
      gridTemplateColumns: 'minmax(180px, 0.24fr) minmax(0, 1fr)'
    }
  },
  responsiveManagerLayout: {
    '@media (min-width: 760px)': {
      gridTemplateColumns: 'minmax(210px, 0.38fr) minmax(0, 1fr)'
    }
  },
  responsivePaperColumns: {
    '@media (min-width: 820px)': {
      columnCount: 2
    }
  },
  responsiveToolList: {
    '@media (min-width: 720px)': {
      gridTemplateColumns: '1fr 1fr'
    }
  },
  responsiveNotes: {
    '@media (min-width: 720px)': {
      gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(0, 1.2fr)'
    }
  },
  responsiveEditor: {
    '@media (min-width: 720px)': {
      gridTemplateColumns: 'minmax(180px, 0.7fr) minmax(0, 1.3fr)'
    }
  },
  responsiveShell: {
    '@media (max-width: 480px)': {
      paddingLeft: 64
    }
  },
  responsivePanelShell: {
    '@media (max-width: 480px)': {
      paddingLeft: 280
    }
  },
  responsiveSidebar: {
    '@media (max-width: 480px)': {
      width: 64
    }
  },
  responsiveSidebarPanel: {
    '@media (max-width: 480px)': {
      left: 64,
      width: 216
    }
  },
  responsiveDesktopButton: {
    '@media (min-width: 1024px)': {
      width: 'auto',
      minWidth: 200
    }
  },
  quizPage: {
    maxWidth: 928
  },
  quizCollections: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    '@media (min-width: 720px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'
    }
  },
  quizCollection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    minHeight: 154,
    padding: 14,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    backgroundColor: '#202226',
    color: '#f2f3f5',
    textAlign: 'left',
    ':hover': {
      borderColor: '#f7c66b',
      backgroundColor: '#25272c'
    }
  },
  quizCollectionActive: {
    borderColor: '#f7c66b',
    backgroundColor: '#25272c'
  },
  collectionKicker: {
    color: '#f7c66b',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase'
  },
  collectionTitle: {
    fontSize: 14,
    lineHeight: 1.2
  },
  collectionDescription: {
    color: '#9b9ea8',
    fontSize: 12,
    lineHeight: 1.4
  },
  collectionMeta: {
    marginTop: 'auto',
    color: '#9b9ea8',
    fontSize: 10
  },
  quizProgressPanel: {
    padding: '14px 16px'
  },
  quizProgressTrack: {
    height: 7,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  quizProgressFill: {
    display: 'block',
    height: '100%',
    borderRadius: 'inherit',
    backgroundColor: '#f7c66b'
  },
  quizCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 19
  },
  quizCardTopline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  quizTopic: {
    padding: '5px 9px',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#9b9ea8',
    fontSize: 11
  },
  quizQuestionTitle: {
    maxWidth: 672,
    margin: 0,
    fontSize: 'clamp(20px, 4vw, 29px)',
    letterSpacing: '-0.03em',
    lineHeight: 1.2
  },
  quizAnswer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 7,
    minHeight: 112,
    padding: 16,
    border: '1px dashed rgba(255,255,255,0.09)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.025)',
    color: '#9b9ea8'
  },
  quizAnswerRevealed: {
    borderStyle: 'solid',
    borderColor: 'rgba(119,166,216,0.4)',
    backgroundColor: 'rgba(119,166,216,0.08)',
    color: '#f2f3f5'
  },
  quizAnswerText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6
  },
  quizActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10
  },
  quizFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 13,
    paddingTop: 13,
    borderTop: '1px solid rgba(255,255,255,0.09)',
    color: '#9b9ea8',
    fontSize: 11
  },
  quizComplete: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    padding: 19
  },
  quizCompleteMark: {
    display: 'grid',
    flex: '0 0 44px',
    placeItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(130,201,155,0.14)',
    color: '#82c99b',
    fontSize: 24,
    fontWeight: 700
  },
  quizCompleteCopy: {
    flex: 1,
    minWidth: 200
  },
  quizCompleteTitle: {
    margin: '3px 0 0',
    fontSize: 17
  },
  quizCompleteText: {
    margin: '6px 0 0',
    color: '#9b9ea8',
    fontSize: 12,
    lineHeight: 1.5
  },
  quizEditorLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 13,
    '@media (min-width: 720px)': {
      gridTemplateColumns: 'minmax(180px, 0.7fr) minmax(0, 1.3fr)'
    }
  },
  quizLibraryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  quizLibraryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    width: '100%',
    padding: 10,
    border: '1px solid transparent',
    borderRadius: 9,
    backgroundColor: 'transparent',
    color: '#f2f3f5',
    textAlign: 'left',
    ':hover': {
      borderColor: '#f7c66b',
      backgroundColor: 'rgba(255,255,255,0.06)'
    }
  },
  quizLibraryItemActive: {
    borderColor: '#f7c66b',
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  quizLibraryMeta: {
    color: '#9b9ea8',
    fontSize: 11
  },
  quizEditorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 13,
    minWidth: 0
  },
  quizForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7
  },
  formLabel: {
    marginTop: 6,
    color: '#9b9ea8',
    fontSize: 12
  },
  formInput: {
    width: '100%',
    minHeight: 44,
    padding: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    outline: 0,
    backgroundColor: '#191a1e',
    color: '#f2f3f5',
    fontSize: 14
  },
  formTextarea: {
    width: '100%',
    padding: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    outline: 0,
    backgroundColor: '#191a1e',
    color: '#f2f3f5',
    fontSize: 14,
    resize: 'vertical'
  },
  formActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  formAction: {
    flex: '1 1 180px'
  },
  questionList: {
    overflow: 'hidden'
  },
  questionListItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    counterReset: 'quiz-question'
  },
  questionListItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '3px 10px',
    padding: '10px 0',
    borderTop: '1px solid rgba(255,255,255,0.09)',
    counterIncrement: 'quiz-question'
  },
  questionNumber: {
    gridRow: 'span 2',
    color: '#9b9ea8',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 11
  },
  questionTopic: {
    color: '#f7c66b',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  questionText: {
    fontSize: 13,
    lineHeight: 1.4
  },
  questionActions: {
    display: 'flex',
    gridColumn: '2 / -1',
    gap: 5
  },
  questionAction: {
    minHeight: 32,
    padding: '5px 8px',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#9b9ea8',
    fontSize: 11,
    fontWeight: 700
  },
  quizEmpty: {
    padding: 19
  }
});
