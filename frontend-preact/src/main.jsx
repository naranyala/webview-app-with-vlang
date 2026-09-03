import { render } from 'preact';
import './styles.css';
import './toolkit.css';
import { App } from './App.jsx';
import { ErrorBoundary } from './error-boundary.jsx';

const mountTarget = document.getElementById('app');

if (!mountTarget) {
  throw new Error('App mount target #app was not found');
}

render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  mountTarget
);
