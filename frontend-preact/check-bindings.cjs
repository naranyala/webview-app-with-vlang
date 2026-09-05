// Keep V binding registration, the JS adapter, and declarations in sync.
const fs = require('node:fs');
const path = require('node:path');

const expected = [
  'greet_from_v',
  'get_time',
  'get_system_info',
  'get_status',
  'get_notes',
  'create_note',
  'update_note',
  'delete_note',
  'save_pdf',
  'increment',
  'reset',
  'minimize_window',
  'maximize_window',
  'restore_window',
  'close_window',
  'quiz_list',
  'quiz_create_collection',
  'quiz_update_collection',
  'quiz_delete_collection',
  'quiz_create_question',
  'quiz_update_question',
  'quiz_delete_question',
  'list_volumes',
  'start_asset_scan',
  'get_asset_scan_status',
  'cancel_asset_scan',
  'get_audio_metadata',
  'analyze_audio',
  'mir_analyze'
];

const root = __dirname;
const bridge = fs.readFileSync(
  path.join(root, '..', 'bridge.v'),
  'utf8'
);
const declarations = fs.readFileSync(
  path.join(root, 'src', 'bindings.d.ts'),
  'utf8'
);
const adapter = fs.readFileSync(path.join(root, 'src', 'backend.js'), 'utf8');

let failed = false;
for (const name of expected) {
  if (!bridge.includes(`'${name}'`)) {
    console.error(`missing ${name} in bridge.v`);
    failed = true;
  }
  if (!adapter.includes(`'${name}'`)) {
    console.error(`missing ${name} in src/backend.js`);
    failed = true;
  }
  if (!declarations.includes(`${name}(`)) {
    console.error(`missing ${name} in src/bindings.d.ts`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`V bindings in sync (${expected.length} names)`);
