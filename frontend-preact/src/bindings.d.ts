/**
 * V backend bindings available as `window.*` inside the native WebView.
 * See `bridge.v` + `plugins.v`.
 * Under `npm run dev` these fall back to mocks via `src/backend.js`.
 */
declare global {
  interface Window {
    greet_from_v(message: string): Promise<string>;
    get_time(): Promise<string>;
    get_system_info(): Promise<string>;
    get_status(): Promise<string>;
    get_notes(): Promise<NativeNote[]>;
    create_note(title: string, tag: string, body: string): Promise<NativeNote>;
    update_note(
      id: string,
      title: string,
      tag: string,
      body: string
    ): Promise<NativeNote>;
    delete_note(id: string): Promise<string>;
    save_pdf(filename: string, dataBase64: string): Promise<string>;
    quiz_list(): Promise<string>;
    quiz_create_collection(payload: string): Promise<string>;
    quiz_update_collection(payload: string): Promise<string>;
    quiz_delete_collection(id: string): Promise<string>;
    quiz_create_question(payload: string): Promise<string>;
    quiz_update_question(payload: string): Promise<string>;
    quiz_delete_question(payload: string): Promise<string>;
    increment(delta: number): Promise<string>;
    reset(): Promise<string>;
    minimize_window(): Promise<string>;
    maximize_window(): Promise<string>;
    restore_window(): Promise<string>;
    close_window(): Promise<string>;
    // Optional camelCase aliases kept for the browser mock bridge.
    getSystemInfo?(): Promise<string>;
    getTimestamp?(): Promise<string>;
    getStatus?(): Promise<string>;
    minimizeWindow?(): Promise<void>;
    maximizeWindow?(): Promise<void>;
    restoreWindow?(): Promise<void>;
    closeWindow?(): Promise<void>;
    __PREACT_MOCK_BRIDGE__?: boolean;
  }
}

interface NativeNote {
  id: string;
  title: string;
  tag: string;
  updated: string;
  body: string;
}

export {};
