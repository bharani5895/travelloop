import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, X, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function Notes() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const trip = state.activeTrip;
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', stopId: '' });
  const [errors, setErrors] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  if (!trip) {
    return (
      <div className="text-center py-16">
        <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-4">No trip selected.</p>
        <button onClick={() => navigate('/trips')} className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm">Go to My Trips</button>
      </div>
    );
  }

  const notes = state.notes.filter(n => n.tripId === trip.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const stops = state.stops.filter(s => s.tripId === trip.id);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.body.trim()) e.body = 'Note body is required';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (editId) {
      const existing = state.notes.find(n => n.id === editId);
      dispatch({ type: 'UPDATE_NOTE', payload: { ...existing, ...form, stopId: form.stopId || null } });
      addToast('Note updated!');
      setEditId(null);
    } else {
      dispatch({ type: 'ADD_NOTE', payload: { id: `n${Date.now()}`, tripId: trip.id, stopId: form.stopId || null, title: form.title, body: form.body, createdAt: new Date().toISOString() } });
      addToast('Note added!');
    }
    setForm({ title: '', body: '', stopId: '' });
    setShowForm(false);
    setErrors({});
  };

  const startEdit = (note) => {
    setEditId(note.id);
    setForm({ title: note.title, body: note.body, stopId: note.stopId || '' });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
    addToast('Note deleted', 'error');
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trip Notes</h1>
          <p className="text-sm text-gray-500">{trip.name}</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setEditId(null); setForm({ title: '', body: '', stopId: '' }); setErrors({}); }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Add Note
        </button>
      </div>

      {/* Note Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">{editId ? 'Edit Note' : 'New Note'}</h3>
          <div className="space-y-3">
            <div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Note title"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.title ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={4} placeholder="Write your note here..."
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none ${errors.body ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
            </div>
            <div>
              <select value={form.stopId} onChange={e => setForm(f => ({ ...f, stopId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
                <option value="">No specific stop (general note)</option>
                {stops.map(s => <option key={s.id} value={s.id}>{s.cityName}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                {editId ? 'Update' : 'Save Note'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); setErrors({}); }}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No notes yet. Add reminders, tips, or important info!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => {
            const linkedStop = stops.find(s => s.id === note.stopId);
            const isExpanded = expandedId === note.id;
            return (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : note.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm">{note.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                        {linkedStop && (
                          <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">{linkedStop.cityName}</span>
                        )}
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.body.slice(0, 100)}{note.body.length > 100 ? '...' : ''}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); startEdit(note); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-teal-600">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{note.body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
