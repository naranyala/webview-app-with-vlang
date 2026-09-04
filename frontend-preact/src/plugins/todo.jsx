import { useEffect, useRef, useState } from 'preact/hooks';
import { parseTodoRecords } from '../schemas.mjs';
import { loadTodosFromStorage, saveTodosToStorage } from '../storage.mjs';
import { styles, stylex } from '../stylex.js';

const STORAGE_KEY = 'preact-todomvc.todos';
const FILTERS = ['all', 'active', 'completed'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

    return parseTodoRecords(savedTodos);
  } catch {
    return [];
  }
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function monthTitle(date) {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });
}

function calendarCells(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstCell = new Date(firstDay);
  firstCell.setDate(firstDay.getDate() - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCell);
    date.setDate(firstCell.getDate() + index);
    return {
      date,
      key: dateKey(date),
      inMonth: date.getMonth() === monthDate.getMonth()
    };
  });
}

function TodoCalendar({
  todos,
  selectedDate,
  onSelectDate,
  monthDate,
  onChangeMonth,
  newTodo,
  onNewTodoChange,
  onAdd,
  onToggle,
  onDelete
}) {
  const selectedTodos = todos.filter((todo) => todo.dueDate === selectedDate);
  const todosByDate = new Map();
  for (const todo of todos) {
    if (!todo.dueDate) continue;
    todosByDate.set(todo.dueDate, (todosByDate.get(todo.dueDate) || 0) + 1);
  }

  return (
    <section {...stylex.props(styles.todoCalendar)} aria-label="Todo calendar">
      <header {...stylex.props(styles.calendarHeader)}>
        <div>
          <p {...stylex.props(styles.todoEyebrow)}>Monthly view</p>
          <h2 {...stylex.props(styles.calendarTitle)}>
            {monthTitle(monthDate)}
          </h2>
        </div>
        <div {...stylex.props(styles.calendarControls)}>
          <button
            type="button"
            {...stylex.props(styles.calendarArrow)}
            onClick={() => onChangeMonth(-1)}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            {...stylex.props(styles.calendarToday)}
            onClick={() => onSelectDate(dateKey(new Date()))}
          >
            Today
          </button>
          <button
            type="button"
            {...stylex.props(styles.calendarArrow)}
            onClick={() => onChangeMonth(1)}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </header>

      <div {...stylex.props(styles.calendarWeekdays)} aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div {...stylex.props(styles.calendarGrid)}>
        {calendarCells(monthDate).map((cell) => {
          const count = todosByDate.get(cell.key) || 0;
          return (
            <button
              type="button"
              key={cell.key}
              {...stylex.props(
                styles.calendarDay,
                !cell.inMonth && styles.calendarDayOutside,
                cell.key === selectedDate && styles.calendarDaySelected,
                cell.key === dateKey(new Date()) && styles.calendarDayToday
              )}
              onClick={() => onSelectDate(cell.key)}
              aria-label={`${cell.date.toLocaleDateString()}${
                count ? `, ${count} todos` : ''
              }`}
              aria-pressed={cell.key === selectedDate}
            >
              <span>{cell.date.getDate()}</span>
              {count > 0 && (
                <small {...stylex.props(styles.calendarDayCount)}>
                  {count}
                </small>
              )}
            </button>
          );
        })}
      </div>

      <div {...stylex.props(styles.calendarDayHeader)}>
        <div>
          <p {...stylex.props(styles.todoEyebrow)}>Selected day</p>
          <h3 {...stylex.props(styles.calendarDayHeaderTitle)}>
            {parseDateKey(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
        </div>
        <span>{selectedTodos.length} scheduled</span>
      </div>

      <form {...stylex.props(styles.calendarAddForm)} onSubmit={onAdd}>
        <input
          {...stylex.props(styles.calendarAddInput)}
          value={newTodo}
          onInput={(event) => onNewTodoChange(event.currentTarget.value)}
          placeholder="Add a todo for this day"
          aria-label="Add todo for selected day"
        />
        <button type="submit" {...stylex.props(styles.calendarAddButton)}>
          Add
        </button>
      </form>

      {selectedTodos.length > 0 ? (
        <ul {...stylex.props(styles.calendarTodoList)}>
          {selectedTodos.map((todo) => (
            <li {...stylex.props(styles.calendarTodo)} key={todo.id}>
              <input
                {...stylex.props(styles.calendarCheckbox)}
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                aria-label={`Complete ${todo.title}`}
              />
              <span
                {...stylex.props(
                  styles.calendarTodoTitle,
                  todo.completed && styles.calendarTodoCompleted
                )}
              >
                {todo.title}
              </span>
              <button
                type="button"
                {...stylex.props(styles.calendarDelete)}
                onClick={() => onDelete(todo.id)}
                aria-label={`Delete ${todo.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p {...stylex.props(styles.calendarEmpty)}>
          No scheduled todos for this day.
        </p>
      )}
    </section>
  );
}

export function TodoApp({ todoView }) {
  const [todos, setTodos] = useState(loadTodos);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState(() => dateKey(new Date()));
  const [workspaceView, setWorkspaceView] = useState(todoView || 'list');
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [monthDate, setMonthDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [storageError, setStorageError] = useState('');
  const [storageReady, setStorageReady] = useState(false);
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
    let active = true;
    loadTodosFromStorage().then((stored) => {
      if (!active) return;
      if (stored !== null) setTodos(stored);
      setStorageReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    let active = true;
    saveTodosToStorage(todos).then((saved) => {
      if (!active) return;
      setStorageError(
        saved ? '' : 'Local changes could not be saved in this browser.'
      );
    });
    return () => {
      active = false;
    };
  }, [storageReady, todos]);

  useEffect(() => {
    if (todoView) setWorkspaceView(todoView);
  }, [todoView]);

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
      { id: createId(), title, completed: false, dueDate: newTodoDate || null }
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

  function selectCalendarDate(nextDate) {
    setSelectedDate(nextDate);
    setNewTodoDate(nextDate);
    const nextMonth = parseDateKey(nextDate);
    setMonthDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
  }

  function changeCalendarMonth(delta) {
    setMonthDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1)
    );
  }

  const calendarView = workspaceView === 'calendar';

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

        {calendarView ? (
          <TodoCalendar
            todos={todos}
            selectedDate={selectedDate}
            onSelectDate={selectCalendarDate}
            monthDate={monthDate}
            onChangeMonth={changeCalendarMonth}
            newTodo={newTodo}
            onNewTodoChange={setNewTodo}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ) : (
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
                  activeCount > 0
                    ? 'Complete all todos'
                    : 'Mark all todos active'
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
              <input
                className={stylex.props(styles.todoDateInput).className}
                type="date"
                value={newTodoDate}
                onInput={(event) => setNewTodoDate(event.currentTarget.value)}
                aria-label="Todo due date"
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
        )}

        <p className={stylex.props(styles.todoHint).className}>
          Double-tap to edit
        </p>
      </div>
    </main>
  );
}
