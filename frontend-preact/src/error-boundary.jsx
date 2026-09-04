import { Component } from 'preact';
import { backendError } from './backend.js';
import { styles, stylex } from './stylex.js';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleReload = this.handleReload.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[frontend:error-boundary]', error);
    }
    if (typeof this.props.onError === 'function') {
      this.props.onError(error);
    }
  }

  handleReload() {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  }

  handleReset() {
    this.setState({ error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  }

  render(props, state) {
    if (state.error) {
      return (
        <div
          {...stylex.props(styles.toolPanel, styles.errorPanel)}
          role="alert"
        >
          <div {...stylex.props(styles.panelHeading)}>
            <div>
              <span {...stylex.props(styles.panelLabel)}>Error</span>
              <h2>Something went wrong</h2>
            </div>
          </div>
          <p {...stylex.props(styles.panelNote)}>{backendError(state.error)}</p>
          <div {...stylex.props(styles.statusActions)}>
            <button
              type="button"
              {...stylex.props(styles.statusAction)}
              onClick={this.handleReset}
            >
              Try again
            </button>
            <button
              type="button"
              {...stylex.props(styles.statusAction)}
              onClick={this.handleReload}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return props.children;
  }
}
