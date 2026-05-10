import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Upload, X } from 'lucide-react';

export default function CreateTrip() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '', coverPhoto: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Trip name is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate <= form.startDate) e.endDate = 'End date must be after start date';
    return e;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, coverPhoto: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      const trip = {
        id: `t${Date.now()}`,
        userId: state.currentUser.id,
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
        coverPhoto: form.coverPhoto,
        isPublic: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      dispatch({ type: 'ADD_TRIP', payload: trip });
      addToast('Trip created successfully!');
      setLoading(false);
      navigate('/trips');
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Trip</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. European Summer 2026"
            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition
              ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition
                ${errors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition
                ${errors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3} placeholder="What's this trip about?"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo (optional)</label>
          {form.coverPhoto ? (
            <div className="relative">
              <img src={form.coverPhoto} alt="Cover" className="w-full h-40 object-cover rounded-lg" />
              <button type="button" onClick={() => setForm(f => ({ ...f, coverPhoto: null }))}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50">
                <X size={14} className="text-red-500" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Click to upload photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Save Trip
        </button>
      </form>
    </div>
  );
}
