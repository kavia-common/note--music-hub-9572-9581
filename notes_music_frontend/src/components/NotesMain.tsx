import { component$, useSignal, useContext, $ } from '@builder.io/qwik';
import { AuthContext } from './auth/AuthContext';

export type Note = {
  id: number;
  title: string;
  content: string;
  created: number;
};

type EditorMode = 'view'|'edit'|'create';

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// PUBLIC_INTERFACE
export default component$(() => {
  // Demo state: replace with API-backed state in production
  const notes = useSignal<Note[]>(() => {
    const saved = localStorage.getItem('demo-notes');
    return saved ? JSON.parse(saved) : [
      {id: 1, title: 'Welcome 🎶', content:'Take notes while listening to your favourite tracks.', created: Date.now()}
    ];
  });
  const filter = useSignal('');
  const selectedId = useSignal<number|null>(null);
  const editorMode = useSignal<EditorMode>('view');
  const editorNote = useSignal<Note|null>(null);

  // Auth gate
  const { user } = useContext(AuthContext);

  // CRUD handlers
  const selectNote = $((id: number) => {
    selectedId.value = id;
    editorMode.value = 'view';
    editorNote.value = null;
  });
  const startEdit = $(() => {
    if (selectedId.value !== null) {
      const n = notes.value.find(n => n.id === selectedId.value);
      if (n) {
        editorMode.value = 'edit';
        editorNote.value = { ...n };
      }
    }
  });
  const startCreate = $(() => {
    editorMode.value = 'create';
    editorNote.value = {
      id: Math.max(0, ...notes.value.map(n=>n.id))+1,
      title: '',
      content: '',
      created: Date.now()
    };
    selectedId.value = null;
  });
  const cancelEdit = $(() => {
    editorMode.value = selectedId.value ? 'view' : 'create';
    editorNote.value = null;
  });
  const saveNote = $(() => {
    if (!editorNote.value) return;
    // Validation
    if (!editorNote.value.title.trim()) return;
    if (editorMode.value === 'edit') {
      notes.value = notes.value.map(n => n.id === editorNote.value!.id ? { ...editorNote.value! } : n);
      selectedId.value = editorNote.value.id;
      editorMode.value = 'view';
    } else if (editorMode.value === 'create') {
      notes.value = [...notes.value, { ...editorNote.value! }];
      selectedId.value = editorNote.value.id;
      editorMode.value = 'view';
    }
    editorNote.value = null;
    localStorage.setItem('demo-notes', JSON.stringify(notes.value));
  });
  const deleteNote = $((id: number) => {
    if (confirm('Delete this note?')) {
      notes.value = notes.value.filter(n => n.id !== id);
      if (selectedId.value === id) selectedId.value = null;
      editorMode.value = 'view';
      localStorage.setItem('demo-notes', JSON.stringify(notes.value));
    }
  });

  // Search/filter
  const filteredNotes = notes.value
    .filter(n => n.title.toLowerCase().includes(filter.value.toLowerCase())
      || n.content.toLowerCase().includes(filter.value.toLowerCase()))
    .sort((a, b) => b.created - a.created);

  const currNote = notes.value.find(n => n.id === selectedId.value);

  // Auth gate
  if (!user.value) {
    return (
      <div style={{margin:'auto', color:'var(--secondary-color)', fontSize:'1.2rem'}}>Sign in to manage your notes.</div>
    );
  }

  return (
    <>
      <div class="header" style={{marginBottom:'1.2rem'}}>
        <input
          class="searchbox"
          type="text"
          placeholder="Search notes..."
          value={filter.value}
          onInput$={e => filter.value = (e.target as HTMLInputElement).value}
        />
        <button class="new-note-btn" onClick$={startCreate}>+ New Note</button>
      </div>
      <section class="notes-list-section">
        <ul class="notes-list">
          {filteredNotes.length === 0 ?
            <div class="notes-empty">No notes found.</div>
            :
            filteredNotes.map(note =>
              <li
                class={`note-row${selectedId.value === note.id ? ' selected' : ''}`}
                key={note.id}
                tabIndex={0}
                onClick$={() => selectNote(note.id)}
              >
                <div>
                  <div class="note-title">{note.title}</div>
                  <div class="note-created">{formatDate(note.created)}</div>
                </div>
                <div class="note-actions">
                  <button onClick$={e => {e.stopPropagation(); editorMode.value!=='edit' && startEdit();}} disabled={selectedId.value !== note.id}>Edit</button>
                  <button class="delete" onClick$={e => {e.stopPropagation(); deleteNote(note.id);}} disabled={selectedId.value !== note.id}>Delete</button>
                </div>
              </li>
            )
          }
        </ul>
      </section>
      <section class="note-editor-section">
        {editorMode.value === 'view' && currNote && (
          <>
            <div class="editor-title">{currNote.title}</div>
            <div style={{color:'var(--secondary-color)', marginBottom:'1.3rem'}}>
              Created {formatDate(currNote.created)}
            </div>
            <div style={{whiteSpace:'pre-wrap', fontSize:'1.09em'}}>{currNote.content}</div>
            <div class="actions" style={{marginTop:'2.2rem'}}>
              <button class="save-btn" style={{minWidth:'130px'}} onClick$={startEdit}>Edit</button>
              <button class="cancel-btn" style={{minWidth:'100px'}} onClick$={startCreate}>New Note</button>
            </div>
          </>
        )}
        {(editorMode.value === 'edit' || editorMode.value === 'create') && (
          <form preventdefault:submit
            class="note-editor"
            style={{maxWidth:'720px'}}
            onSubmit$={saveNote}>
              <input
                type="text"
                placeholder="Note title"
                value={editorNote.value?.title || ''}
                onInput$={e => editorNote.value!.title = (e.target as HTMLInputElement).value}
                required
                maxLength={120}
                autoFocus
              />
              <textarea
                placeholder="Your note..."
                value={editorNote.value?.content || ''}
                onInput$={e => editorNote.value!.content = (e.target as HTMLTextAreaElement).value}
                rows={8}
                required
                style={{resize:'vertical'}}
              />
              <div class="actions">
                <button class="save-btn" type="submit">Save</button>
                <button class="cancel-btn" type="button" onClick$={cancelEdit}>Cancel</button>
              </div>
          </form>
        )}
        {!currNote && editorMode.value==='view' && (
          <div style={{color:'var(--secondary-color)', textAlign:'center'}}>No note selected.</div>
        )}
      </section>
    </>
  );
});
