import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITIES } from '../data/mockData';
import { Plus, Trash2, ChevronUp, ChevronDown, X, MapPin, Clock, DollarSign } from 'lucide-react';

export default function ItineraryBuilder() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const trip = state.activeTrip;

  const [showStopModal, setShowStopModal] = useState(false);
  const [stopForm, setStopForm] = useState({ cityId: '', arrivalDate: '', departureDate: '' });
  const [stopErrors, setStopErrors] = useState({});
  const [showActivityModal, setShowActivityModal] = useState(null); // stopId
  const [actForm, setActForm] = useState({ name: '', time: '', cost: '', category: 'Sightseeing', duration: '' });
  const [actErrors, setActErrors] = useState({});

  if (!trip) {
    return (
      <div className="text-center py-16">
        <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-4">No trip selected. Go to My Trips and click "Build".</p>
        <button onClick={() => navigate('/trips')} className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm">Go to My Trips</button>
      </div>
    );
  }

  const stops = state.stops.filter(s => s.tripId === trip.id).sort((a, b) => a.order - b.order);

  const validateStop = () => {
    const e = {};
    if (!stopForm.cityId) e.cityId = 'Select a city';
    if (!stopForm.arrivalDate) e.arrivalDate = 'Required';
    if (!stopForm.departureDate) e.departureDate = 'Required';
    if (stopForm.arrivalDate && stopForm.departureDate && stopForm.departureDate < stopForm.arrivalDate) e.departureDate = 'Must be after arrival';
    return e;
  };

  const addStop = () => {
    const e = validateStop();
    if (Object.keys(e).length) { setStopErrors(e); return; }
    const city = CITIES.find(c => c.id === stopForm.cityId);
    const stop = {
      id: `s${Date.now()}`, tripId: trip.id, cityId: city.id, cityName: city.name,
      arrivalDate: stopForm.arrivalDate, departureDate: stopForm.departureDate, order: stops.length,
    };
    dispatch({ type: 'ADD_STOP', payload: stop });
    addToast(`${city.name} added as a stop!`);
    setShowStopModal(false);
    setStopForm({ cityId: '', arrivalDate: '', departureDate: '' });
    setStopErrors({});
  };

  const deleteStop = (stopId) => {
    dispatch({ type: 'DELETE_STOP', payload: stopId });
    addToast('Stop removed', 'error');
  };

  const reorder = (stopId, dir) => {
    const sorted = [...stops];
    const idx = sorted.findIndex(s => s.id === stopId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    [sorted[idx], sorted[newIdx]] = [sorted[newIdx], sorted[idx]];
    const reordered = sorted.map((s, i) => ({ ...s, order: i }));
    dispatch({ type: 'REORDER_STOPS', payload: [...state.stops.filter(s => s.tripId !== trip.id), ...reordered] });
  };

  const validateAct = () => {
    const e = {};
    if (!actForm.name.trim()) e.name = 'Required';
    if (!actForm.time) e.time = 'Required';
    return e;
  };

  const addActivity = () => {
    const e = validateAct();
    if (Object.keys(e).length) { setActErrors(e); return; }
    const act = {
      id: `act${Date.now()}`, stopId: showActivityModal, tripId: trip.id,
      name: actForm.name, time: actForm.time, cost: parseFloat(actForm.cost) || 0,
      category: actForm.category, duration: actForm.duration,
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: act });
    addToast('Activity added!');
    setShowActivityModal(null);
    setActForm({ name: '', time: '', cost: '', category: 'Sightseeing', duration: '' });
    setActErrors({});
  };

  const deleteActivity = (actId) => {
    dispatch({ type: 'DELETE_ACTIVITY', payload: actId });
    addToast('Activity removed', 'error');
  };

  const CATEGORIES = ['Sightseeing', 'Food', 'Adventure', 'Culture', 'Other'];
  const categoryColors = { Sightseeing: 'bg-blue-100 text-blue-700', Food: 'bg-orange-100 text-orange-700', Adventure: 'bg-green-100 text-green-700', Culture: 'bg-purple-100 text-purple-700', Other: 'bg-gray-100 text-gray-700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{trip.name}</h1>
          <p className="text-sm text-gray-500">{trip.startDate} → {trip.endDate}</p>
        </div>
        <button onClick={() => setShowStopModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Add Stop
        </button>
      </div>

      {stops.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">No stops yet. Add your first city!</p>
          <button onClick={() => setShowStopModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Add Stop</button>
        </div>
      ) : (
        <div className="space-y-4">
          {stops.map((stop, idx) => {
            const activities = state.activities.filter(a => a.stopId === stop.id).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={stop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{stop.cityName}</h3>
                      <p className="text-xs text-gray-500">{stop.arrivalDate} → {stop.departureDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => reorder(stop.id, -1)} disabled={idx === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"><ChevronUp size={16} /></button>
                    <button onClick={() => reorder(stop.id, 1)} disabled={idx === stops.length - 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"><ChevronDown size={16} /></button>
                    <button onClick={() => deleteStop(stop.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="p-4">
                  {activities.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {activities.map(act => (
                        <div key={act.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[act.category] || categoryColors.Other}`}>{act.category}</span>
                          <span className="text-sm font-medium text-gray-700 flex-1">{act.name}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={11} />{act.time}</span>
                          <span className="flex items-center gap-1 text-xs text-teal-600 font-medium"><DollarSign size={11} />{act.cost}</span>
                          <button onClick={() => deleteActivity(act.id)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setShowActivityModal(stop.id); setActErrors({}); }}
                    className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
                    <Plus size={15} /> Add Activity
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Stop Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Add Stop</h3>
              <button onClick={() => setShowStopModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select value={stopForm.cityId} onChange={e => setStopForm(f => ({ ...f, cityId: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${stopErrors.cityId ? 'border-red-400' : 'border-gray-200'}`}>
                  <option value="">Select a city...</option>
                  {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
                </select>
                {stopErrors.cityId && <p className="text-red-500 text-xs mt-1">{stopErrors.cityId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                <input type="date" value={stopForm.arrivalDate} onChange={e => setStopForm(f => ({ ...f, arrivalDate: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${stopErrors.arrivalDate ? 'border-red-400' : 'border-gray-200'}`} />
                {stopErrors.arrivalDate && <p className="text-red-500 text-xs mt-1">{stopErrors.arrivalDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                <input type="date" value={stopForm.departureDate} onChange={e => setStopForm(f => ({ ...f, departureDate: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${stopErrors.departureDate ? 'border-red-400' : 'border-gray-200'}`} />
                {stopErrors.departureDate && <p className="text-red-500 text-xs mt-1">{stopErrors.departureDate}</p>}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={addStop} className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">Add Stop</button>
                <button onClick={() => setShowStopModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Add Activity</h3>
              <button onClick={() => setShowActivityModal(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
                <input value={actForm.name} onChange={e => setActForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Eiffel Tower Visit"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${actErrors.name ? 'border-red-400' : 'border-gray-200'}`} />
                {actErrors.name && <p className="text-red-500 text-xs mt-1">{actErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={actForm.time} onChange={e => setActForm(f => ({ ...f, time: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${actErrors.time ? 'border-red-400' : 'border-gray-200'}`} />
                  {actErrors.time && <p className="text-red-500 text-xs mt-1">{actErrors.time}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                  <input type="number" min="0" value={actForm.cost} onChange={e => setActForm(f => ({ ...f, cost: e.target.value }))}
                    placeholder="0" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={actForm.category} onChange={e => setActForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input value={actForm.duration} onChange={e => setActForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="e.g. 2h" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={addActivity} className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">Add</button>
                <button onClick={() => setShowActivityModal(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
