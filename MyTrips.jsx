import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Calendar, Edit2, Trash2, Eye, PlusCircle, Map } from 'lucide-react';

export default function MyTrips() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editTrip, setEditTrip] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});

  const userTrips = state.trips
    .filter(t => t.userId === state.currentUser?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStopCount = (tripId) => state.stops.filter(s => s.tripId === tripId).length;

  const handleDelete = (tripId) => {
    dispatch({ type: 'DELETE_TRIP', payload: tripId });
    addToast('Trip deleted', 'error');
    setDeleteConfirm(null);
  };

  const handleView = (trip) => {
    dispatch({ type: 'SET_ACTIVE_TRIP', payload: trip });
    navigate('/itinerary-view');
  };

  const handleBuild = (trip) => {
    dispatch({ type: 'SET_ACTIVE_TRIP', payload: trip });
    navigate('/itinerary-builder');
  };

  const startEdit = (trip) => {
    setEditTrip(trip.id);
    setEditForm({ name: trip.name, startDate: trip.startDate, endDate: trip.endDate, description: trip.description });
    setErrors({});
  };

  const saveEdit = () => {
    const e = {};
    if (!editForm.name.trim()) e.name = 'Required';
    if (!editForm.startDate) e.startDate = 'Required';
    if (!editForm.endDate) e.endDate = 'Required';
    if (editForm.endDate <= editForm.startDate) e.endDate = 'Must be after start';
    if (Object.keys(e).length) { setErrors(e); return; }
    const trip = state.trips.find(t => t.id === editTrip);
    dispatch({ type: 'UPDATE_TRIP', payload: { ...trip, ...editForm } });
    addToast('Trip updated!');
    setEditTrip(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
        <button onClick={() => navigate('/create-trip')}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <PlusCircle size={16} /> New Trip
        </button>
      </div>

      {userTrips.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <Map size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium mb-2">No trips yet</p>
          <p className="text-gray-400 text-sm mb-4">Start planning your first adventure!</p>
          <button onClick={() => navigate('/create-trip')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Create Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userTrips.map(trip => (
            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {editTrip === trip.id ? (
                <div className="p-4 space-y-3">
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="Trip name" />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                      className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.startDate ? 'border-red-400' : 'border-gray-200'}`} />
                    <input type="date" value={editForm.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))}
                      className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.endDate ? 'border-red-400' : 'border-gray-200'}`} />
                  </div>
                  {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
                  <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                    placeholder="Description" />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 transition-colors">Save</button>
                    <button onClick={() => setEditTrip(null)} className="flex-1 bg-gray-100 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-32 bg-gradient-to-br from-teal-400 to-teal-600 relative">
                    {trip.coverPhoto && <img src={trip.coverPhoto} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/25 flex items-end p-3">
                      <h3 className="text-white font-semibold">{trip.name}</h3>
                    </div>
                    {trip.isPublic && (
                      <span className="absolute top-2 right-2 bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full">Public</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1"><Calendar size={12} />{trip.startDate} → {trip.endDate}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{getStopCount(trip.id)} stops</span>
                    </div>
                    {trip.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{trip.description}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => handleView(trip)}
                        className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors">
                        <Eye size={13} /> View
                      </button>
                      <button onClick={() => handleBuild(trip)}
                        className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                        <Map size={13} /> Build
                      </button>
                      <button onClick={() => startEdit(trip)}
                        className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit2 size={13} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(trip.id)}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors ml-auto">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Trip?</h3>
            <p className="text-sm text-gray-500 mb-4">This will permanently delete the trip and all its stops, activities, and notes.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
