import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, DollarSign, Plus, Trash2, TrendingUp } from 'lucide-react';

const CATEGORY_COLORS = { Transport: '#14b8a6', Stay: '#f59e0b', Activities: '#8b5cf6', Meals: '#f97316', Other: '#6b7280' };

export default function Budget() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const trip = state.activeTrip;
  const [dailyLimit, setDailyLimit] = useState(200);
  const [newItem, setNewItem] = useState({ category: 'Transport', description: '', amount: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [errors, setErrors] = useState({});

  if (!trip) {
    return (
      <div className="text-center py-16">
        <DollarSign size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-4">No trip selected.</p>
        <button onClick={() => navigate('/trips')} className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm">Go to My Trips</button>
      </div>
    );
  }

  const budgetItems = state.budgetItems.filter(b => b.tripId === trip.id);
  const activities = state.activities.filter(a => a.tripId === trip.id);
  const stops = state.stops.filter(s => s.tripId === trip.id);

  // Aggregate by category
  const categoryTotals = { Transport: 0, Stay: 0, Activities: 0, Meals: 0, Other: 0 };
  budgetItems.forEach(b => { categoryTotals[b.category] = (categoryTotals[b.category] || 0) + b.amount; });
  activities.forEach(a => { categoryTotals['Activities'] = (categoryTotals['Activities'] || 0) + (a.cost || 0); });

  const totalCost = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  // Days
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
  const avgPerDay = totalCost / totalDays;

  // Pie data
  const pieData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Bar data — cost per stop
  const barData = stops.map(stop => {
    const actCost = activities.filter(a => a.stopId === stop.id).reduce((s, a) => s + (a.cost || 0), 0);
    const days = Math.max(1, Math.ceil((new Date(stop.departureDate) - new Date(stop.arrivalDate)) / (1000 * 60 * 60 * 24)) + 1);
    const dailyCost = actCost / days;
    return { name: stop.cityName, cost: actCost, daily: Math.round(dailyCost), overBudget: dailyCost > dailyLimit };
  });

  const addBudgetItem = () => {
    const e = {};
    if (!newItem.description.trim()) e.description = 'Required';
    if (!newItem.amount || isNaN(newItem.amount) || parseFloat(newItem.amount) <= 0) e.amount = 'Enter a valid amount';
    if (Object.keys(e).length) { setErrors(e); return; }
    dispatch({ type: 'ADD_BUDGET_ITEM', payload: { id: `b${Date.now()}`, tripId: trip.id, ...newItem, amount: parseFloat(newItem.amount) } });
    addToast('Budget item added!');
    setNewItem({ category: 'Transport', description: '', amount: '' });
    setShowAdd(false);
    setErrors({});
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget</h1>
          <p className="text-sm text-gray-500">{trip.name}</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Total Estimated</p>
          <p className="text-2xl font-bold text-teal-600">${totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Avg / Day</p>
          <p className="text-2xl font-bold text-amber-500">${Math.round(avgPerDay)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Trip Days</p>
          <p className="text-2xl font-bold text-purple-500">{totalDays}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Daily Limit</p>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">$</span>
            <input type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))}
              className="w-16 text-xl font-bold text-red-500 focus:outline-none border-b border-gray-200" />
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAdd && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Add Budget Item</h3>
          <div className="flex flex-wrap gap-3">
            <select value={newItem.category} onChange={e => setNewItem(f => ({ ...f, category: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
              {Object.keys(CATEGORY_COLORS).map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex-1 min-w-40">
              <input value={newItem.description} onChange={e => setNewItem(f => ({ ...f, description: e.target.value }))}
                placeholder="Description"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <input type="number" value={newItem.amount} onChange={e => setNewItem(f => ({ ...f, amount: e.target.value }))}
                placeholder="Amount $"
                className={`w-28 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.amount ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            <button onClick={addBudgetItem} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">Add</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Spend by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${v}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data yet</p>}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Cost per Stop</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${v}`} />
                <Bar dataKey="cost" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No stops yet</p>}
        </div>
      </div>

      {/* Over Budget Alerts */}
      {barData.some(d => d.overBudget) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-semibold text-red-700">Over Budget Alert</h3>
          </div>
          {barData.filter(d => d.overBudget).map(d => (
            <p key={d.name} className="text-sm text-red-600">{d.name}: ${d.daily}/day exceeds your ${dailyLimit}/day limit</p>
          ))}
        </div>
      )}

      {/* Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Budget Breakdown</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {Object.entries(categoryTotals).filter(([, v]) => v > 0).map(([cat, total]) => (
            <div key={cat} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                <span className="text-sm font-medium text-gray-700">{cat}</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">${total.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <span className="text-sm font-bold text-gray-800">Total</span>
            <span className="text-sm font-bold text-teal-600">${totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Budget Items List */}
      {budgetItems.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">Manual Budget Items</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {budgetItems.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: CATEGORY_COLORS[item.category] + '20', color: CATEGORY_COLORS[item.category] }}>{item.category}</span>
                  <span className="text-sm text-gray-700">{item.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">${item.amount}</span>
                  <button onClick={() => { dispatch({ type: 'DELETE_BUDGET_ITEM', payload: item.id }); addToast('Item removed', 'error'); }}
                    className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
