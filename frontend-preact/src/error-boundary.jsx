import { Component } from 'preact';
import { backendError } from './backend.js';

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
        <div className="tool-panel" role="alert">
          <div className="panel-heading">
            <div>
              <span className="panel-label">Error</span>
              <h2>Something went wrong</h2>
            </div>
          </div>
          <p className="panel-note">{backendError(state.error)}</p>
          <div className="backend-status-actions">
            <button type="button" onClick={this.handleReset}>
              Try again
            </button>
            <button type="button" onClick={this.handleReload}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return props.children;
  }
}
