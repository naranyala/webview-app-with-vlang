import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/preact';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ChainNotes } from './chain-notes.jsx';

vi.mock('../note-pdf.mjs', () => ({}));

const notes = [
  { id: 'a', title: 'First', tag: 'Draft', updated: 'Today', body: '' },
  { id: 'b', title: 'Second', tag: 'Draft', updated: 'Today', body: '' }
];

beforeEach(() => {
  window.localStorage.clear();
  window.get_notes = vi.fn(async () =>
    JSON.stringify({ ok: true, data: JSON.stringify(notes) })
  );
  window.update_note = vi.fn(async (id, title, tag, body) =>
    JSON.stringify({
      ok: true,
      data: JSON.stringify({ id, title, tag, body, updated: 'Just now' })
    })
  );
});

afterEach(() => {
  cleanup();
  delete window.get_notes;
  delete window.update_note;
});

async function editFirst() {
  await waitFor(() =>
    expect(screen.getByLabelText('Note title').value).toBe('First')
  );
  fireEvent.input(screen.getByLabelText('AI chat answer'), {
    target: { value: 'Keep this edit' }
  });
}

test('switching notes immediately flushes the pending native edit', async () => {
  render(<ChainNotes />);
  await editFirst();
  fireEvent.click(screen.getByText('Second'));
  await waitFor(() => expect(window.update_note).toHaveBeenCalledTimes(1));
  expect(window.update_note.mock.calls[0][0]).toBe('a');
  expect(window.update_note.mock.calls[0][3]).toContain('Keep this edit');
  expect(screen.getByLabelText('Note title').value).toBe('Second');
});

test('leaving the notes workspace flushes its pending native edit', async () => {
  const { unmount } = render(<ChainNotes />);
  await editFirst();
  unmount();
  await waitFor(() => expect(window.update_note).toHaveBeenCalledTimes(1));
  expect(window.update_note.mock.calls[0][3]).toContain('Keep this edit');
});
