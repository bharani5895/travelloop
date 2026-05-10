import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, RotateCcw, Package, CheckCircle2, Circle } from 'lucide-react';

const CATEGORIES = ['Clothing', 'Documents', 'Electronics', 'Toiletries', 'Other'];
const catColors = { Clothing: 'bg-pink-100 text-pink-700', Documents: 'bg-blue-100 text-blue-700', Electronics: 'bg-purple-100 text-purple-700', Toiletries: 'bg-green-100 text-green-700', Other: 'bg-gray-100 text-gray-700' };

export default function Packing() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const trip = state.activeTrip;
  const [newItem, setNewItem] = useState({ name: '', category: 'Clothing' });
  const [errors, setErrors] = useState({});
  const [filterCat, setFilterCat] = useState('All');

  if (!trip) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-4">No trip selected.</p>
        <button onClick={() => navigate('/trips')} className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm">Go to My Trips</button>
      </div>
    );
  }

  const items = state.packingItems.filter(p => p.tripId === trip.id);
  const filtered = filterCat === 'All' ? items : items.filter(p => p.category === filterCat);
  const packedCount = items.filter(p => p.packed).length;

  const addItem = () => {
    if (!newItem.name.trim()) { setErrors({ name: 'Item name is required' }); return; }
    dispatch({ type: 'ADD_PACKING_ITEM', payload: { id: `p${Date.now()}`, tripId: trip.id, name: newItem.name.trim(), category: newItem.category, packed: false } });
    addToast('Item added!');
    setNewItem(f => ({ ...f, name: '' }));
    setErrors({});
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = filtered.filter(p => p.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Packing Checklist</h1>
          <p className="text-sm text-gray-500">{trip.name}</p>
        </div>
        <button onClick={() => { dispatch({ type: 'RESET_CHECKLIST', payload: trip.id }); addToast('Checklist reset!', 'info'); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Packing Progress</span>
          <span className="text-sm font-bold text-teal-600">{packedCount} / {items.length} packed</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: items.length > 0 ? `${(packedCount / items.length) * 100}%` : '0%' }} />
        </div>
        {items.length > 0 && packedCount === items.length && (
          <p className="text-sm text-teal-600 font-medium mt-2 text-center">🎉 All packed! Ready to go!</p>
        )}
      </div>

      {/* Add Item */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input value={newItem.name} onChange={e => setNewItem(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add item (e.g. Passport)"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <select value={newItem.category} onChange={e => setNewItem(f => ({ ...f, category: e.target.value }))}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={addItem} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg transition-colors">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors
              ${filterCat === cat ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No items yet. Start adding things to pack!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColors[cat]}`}>{cat}</span>
                <span className="text-xs text-gray-400">{catItems.filter(i => i.packed).length}/{catItems.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {catItems.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${item.packed ? 'bg-gray-50' : ''}`}>
                    <button onClick={() => dispatch({ type: 'TOGGLE_PACKING_ITEM', payload: item.id })}
                      className="flex-shrink-0 transition-colors">
                      {item.packed
                        ? <CheckCircle2 size={20} className="text-teal-500" />
                        : <Circle size={20} className="text-gray-300 hover:text-teal-400" />}
                    </button>
                    <span className={`flex-1 text-sm transition-all ${item.packed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                    <button onClick={() => { dispatch({ type: 'DELETE_PACKING_ITEM', payload: item.id }); addToast('Item removed', 'error'); }}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
