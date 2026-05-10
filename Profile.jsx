import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITIES } from '../data/mockData';
import { Upload, X, Trash2, BookmarkCheck, User } from 'lucide-react';

export default function Profile() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser;
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', language: user?.language || 'English', photo: user?.photo || null });
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_USER', payload: { ...user, ...form } });
      addToast('Profile updated successfully!');
      setSaving(false);
    }, 600);
  };

  const handleDeleteAccount = () => {
    dispatch({ type: 'LOGOUT' });
    addToast('Account deleted', 'error');
    navigate('/login');
  };

  const savedCities = CITIES.filter(c => user?.savedDestinations?.includes(c.id));

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile & Settings</h1>

      {/* Profile Photo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="font-semibold text-gray-700 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center flex-shrink-0">
            {form.photo
              ? <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
              : <User size={32} className="text-teal-500" />}
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm text-gray-600 px-4 py-2 rounded-lg transition-colors">
              <Upload size={15} /> Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            {form.photo && (
              <button onClick={() => setForm(f => ({ ...f, photo: null }))} className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                <X size={12} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="font-semibold text-gray-700 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language Preference</label>
            <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
              {['English', 'French', 'Spanish'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Save Changes
        </button>
      </div>

      {/* Saved Destinations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BookmarkCheck size={18} className="text-teal-500" /> Saved Destinations
        </h2>
        {savedCities.length === 0 ? (
          <p className="text-sm text-gray-400">No saved destinations yet. Bookmark cities from the City Search page.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedCities.map(city => (
              <div key={city.id} className="flex items-center gap-2 bg-teal-50 text-teal-700 text-sm px-3 py-1.5 rounded-full">
                <span>{city.name}, {city.country}</span>
                <button onClick={() => { dispatch({ type: 'TOGGLE_SAVED_DESTINATION', payload: city.id }); addToast('Removed from saved'); }}
                  className="hover:text-red-500 transition-colors"><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data.</p>
        <button onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Trash2 size={15} /> Delete Account
        </button>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 mb-4">This action is irreversible. All your trips, notes, and data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteAccount} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
