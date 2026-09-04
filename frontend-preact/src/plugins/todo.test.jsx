import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, test } from 'vitest';
import { TodoApp } from './todo.jsx';

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '';
});

function addTodo(title) {
  const input = screen.getByLabelText('New todo');
  fireEvent.input(input, { target: { value: title } });
  fireEvent.submit(input.closest('form'));
}

describe('TodoApp', () => {
  test('renders and adds a todo', () => {
    render(<TodoApp todoView="list" />);
    expect(screen.getByText('todos')).toBeTruthy();
    addTodo('Buy milk');
    expect(screen.getByText('Buy milk')).toBeTruthy();
  });

  test('toggles completion and filters active todos', () => {
    render(<TodoApp todoView="list" />);
    addTodo('One');
    addTodo('Two');
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'active' }));
    expect(screen.queryByText('One')).toBeNull();
    expect(screen.getByText('Two')).toBeTruthy();
  });

  test('renders the calendar workspace', () => {
    render(<TodoApp todoView="calendar" />);
    expect(screen.getByText('Monthly view')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Today' })).toBeTruthy();
  });
});
