import { useEffect, useRef, useState } from 'preact/hooks';
import { styles, stylex } from '../stylex.js';

const STORAGE_KEY = 'preact-todomvc.todos';
const FILTERS = ['all', 'active', 'completed'];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readFilter() {
  if (typeof window === 'undefined') {
    return 'all';
  }

  const hashFilter = window.location.hash.replace(/^#\/?/, '');
  return FILTERS.includes(hashFilter) ? hashFilter : 'all';
}

function loadTodos() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedTodos = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(savedTodos)) {
      return [];
    }

    return savedTodos.filter(
      (todo) =>
        todo &&
        typeof todo.id === 'string' &&
        typeof todo.title === 'string' &&
        typeof todo.completed === 'boolean'
    );
  } catch {
    return [];
  }
}

export function TodoApp() {
  const [todos, setTodos] = useState(loadTodos);
  const [newTodo, setNewTodo] = useState('');
  const [storageError, setStorageError] = useState('');
  const [filter, setFilter] = useState(readFilter);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef(null);
  const cancelEditRef = useRef(false);

  const activeCount = todos.reduce(
    (count, todo) => count + (todo.completed ? 0 : 1),
    0
  );
  const completedCount = todos.length - activeCount;
  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      setStorageError('');
    } catch {
      setStorageError('Local changes could not be saved in this browser.');
    }
  }, [todos]);

  useEffect(() => {
    const handleHashChange = () => setFilter(readFilter());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  function addTodo(event) {
    event.preventDefault();
    const title = newTodo.trim();
    if (!title) return;

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: createId(), title, completed: false }
    ]);
    setNewTodo('');
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function toggleAll() {
    const shouldComplete = activeCount > 0;
    setTodos((currentTodos) =>
      currentTodos.map((todo) => ({ ...todo, completed: shouldComplete }))
    );
  }

  function beginEditing(todo) {
    cancelEditRef.current = false;
    setEditingId(todo.id);
    setEditValue(todo.title);
  }

  function cancelEditing() {
    cancelEditRef.current = true;
    setEditingId(null);
    setEditValue('');
  }

  function finishEditing(save) {
    if (!editingId) return;

    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      setEditingId(null);
      setEditValue('');
      return;
    }

    const title = editValue.trim();

    if (save && title) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === editingId ? { ...todo, title } : todo
        )
      );
    } else if (save && !title) {
      deleteTodo(editingId);
    }

    setEditingId(null);
    setEditValue('');
  }

  function chooseFilter(nextFilter) {
    setFilter(nextFilter);
    const nextHash = nextFilter === 'all' ? '#/' : `#/${nextFilter}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  function clearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  }

  return (
    <main className={stylex.props(styles.todoShell).className}>
      <div className={stylex.props(styles.todoContainer).className}>
        <header className={stylex.props(styles.todoHeader).className}>
          <div>
            <p className={stylex.props(styles.todoEyebrow).className}>
              Keep it light
            </p>
            <h1 className={stylex.props(styles.todoTitle).className}>todos</h1>
          </div>
          <p className={stylex.props(styles.todoLead).className}>
            Capture what matters.
          </p>
        </header>

        <section
          className={stylex.props(styles.todoCard).className}
          aria-label="Todo list"
        >
          {storageError && (
            <p
              className={stylex.props(styles.todoStorageError).className}
              role="alert"
            >
              {storageError}
            </p>
          )}
          <form
            className={stylex.props(styles.newTodoRow).className}
            onSubmit={addTodo}
          >
            <button
              className={stylex.props(styles.toggleAll).className}
              type="button"
              aria-label={
                activeCount > 0 ? 'Complete all todos' : 'Mark all todos active'
              }
              onClick={toggleAll}
              disabled={todos.length === 0}
            >
              ↓
            </button>
            <input
              className={stylex.props(styles.todoInput).className}
              value={newTodo}
              onInput={(event) => setNewTodo(event.currentTarget.value)}
              placeholder="What needs doing?"
              aria-label="New todo"
              autoComplete="off"
            />
          </form>

          {todos.length > 0 && (
            <ul
              className={stylex.props(styles.todoList).className}
              aria-live="polite"
            >
              {visibleTodos.map((todo) => (
                <li
                  className={stylex.props(styles.todoItem).className}
                  key={todo.id}
                >
                  {editingId === todo.id ? (
                    <input
                      className={stylex.props(styles.todoEdit).className}
                      ref={editInputRef}
                      value={editValue}
                      onInput={(event) =>
                        setEditValue(event.currentTarget.value)
                      }
                      onBlur={() => finishEditing(true)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') finishEditing(true);
                        if (event.key === 'Escape') {
                          cancelEditing();
                        }
                      }}
                      aria-label="Edit todo"
                    />
                  ) : (
                    <div className={stylex.props(styles.todoView).className}>
                      <input
                        className={
                          stylex.props(
                            styles.todoCheckbox,
                            todo.completed && styles.todoCheckboxChecked
                          ).className
                        }
                        id={`todo-${todo.id}`}
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <label
                        className={
                          stylex.props(
                            styles.todoLabel,
                            todo.completed && styles.todoLabelChecked
                          ).className
                        }
                        htmlFor={`todo-${todo.id}`}
                        onDblClick={() => beginEditing(todo)}
                      >
                        {todo.title}
                      </label>
                      <button
                        className={stylex.props(styles.destroy).className}
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                        aria-label={`Delete ${todo.title}`}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {todos.length > 0 && (
            <footer className={stylex.props(styles.todoFooter).className}>
              <span className={stylex.props(styles.todoCount).className}>
                <strong className={stylex.props(styles.todoStrong).className}>
                  {activeCount}
                </strong>{' '}
                {activeCount === 1 ? 'item' : 'items'} left
              </span>
              <nav
                className={stylex.props(styles.filterNav).className}
                aria-label="Todo filters"
              >
                {FILTERS.map((filterName) => (
                  <button
                    className={
                      stylex.props(
                        styles.filterButton,
                        filter === filterName && styles.filterActive
                      ).className
                    }
                    type="button"
                    onClick={() => chooseFilter(filterName)}
                    aria-current={filter === filterName ? 'page' : undefined}
                    key={filterName}
                  >
                    {filterName}
                  </button>
                ))}
              </nav>
              {completedCount > 0 ? (
                <button
                  className={stylex.props(styles.clearButton).className}
                  type="button"
                  onClick={clearCompleted}
                >
                  Clear completed
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
            </footer>
          )}

          {todos.length > 0 && visibleTodos.length === 0 && (
            <p className={stylex.props(styles.emptyTodo).className}>
              Nothing here right now.
            </p>
          )}
        </section>

        <p className={stylex.props(styles.todoHint).className}>
          Double-tap to edit
        </p>
      </div>
    </main>
  );
}
