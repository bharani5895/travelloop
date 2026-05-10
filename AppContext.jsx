import { createContext, useContext, useReducer, useState } from 'react';
import {
  INITIAL_USERS, INITIAL_TRIPS, INITIAL_STOPS, INITIAL_ACTIVITIES,
  INITIAL_BUDGET_ITEMS, INITIAL_PACKING_ITEMS, INITIAL_NOTES
} from '../data/mockData';

const AppContext = createContext(null);

const initialState = {
  users: INITIAL_USERS,
  trips: INITIAL_TRIPS,
  stops: INITIAL_STOPS,
  activities: INITIAL_ACTIVITIES,
  budgetItems: INITIAL_BUDGET_ITEMS,
  packingItems: INITIAL_PACKING_ITEMS,
  notes: INITIAL_NOTES,
  currentUser: null,
  activeTrip: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN': return { ...state, currentUser: action.payload };
    case 'LOGOUT': return { ...state, currentUser: null, activeTrip: null };
    case 'SIGNUP': return { ...state, users: [...state.users, action.payload], currentUser: action.payload };
    case 'UPDATE_USER': return {
      ...state,
      users: state.users.map(u => u.id === action.payload.id ? action.payload : u),
      currentUser: action.payload,
    };
    case 'SET_ACTIVE_TRIP': return { ...state, activeTrip: action.payload };
    case 'ADD_TRIP': return { ...state, trips: [...state.trips, action.payload] };
    case 'UPDATE_TRIP': return { ...state, trips: state.trips.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TRIP': return {
      ...state,
      trips: state.trips.filter(t => t.id !== action.payload),
      stops: state.stops.filter(s => s.tripId !== action.payload),
      activities: state.activities.filter(a => a.tripId !== action.payload),
      budgetItems: state.budgetItems.filter(b => b.tripId !== action.payload),
      packingItems: state.packingItems.filter(p => p.tripId !== action.payload),
      notes: state.notes.filter(n => n.tripId !== action.payload),
    };
    case 'ADD_STOP': return { ...state, stops: [...state.stops, action.payload] };
    case 'UPDATE_STOP': return { ...state, stops: state.stops.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STOP': return {
      ...state,
      stops: state.stops.filter(s => s.id !== action.payload),
      activities: state.activities.filter(a => a.stopId !== action.payload),
    };
    case 'REORDER_STOPS': return { ...state, stops: action.payload };
    case 'ADD_ACTIVITY': return { ...state, activities: [...state.activities, action.payload] };
    case 'UPDATE_ACTIVITY': return { ...state, activities: state.activities.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_ACTIVITY': return { ...state, activities: state.activities.filter(a => a.id !== action.payload) };
    case 'ADD_BUDGET_ITEM': return { ...state, budgetItems: [...state.budgetItems, action.payload] };
    case 'DELETE_BUDGET_ITEM': return { ...state, budgetItems: state.budgetItems.filter(b => b.id !== action.payload) };
    case 'ADD_PACKING_ITEM': return { ...state, packingItems: [...state.packingItems, action.payload] };
    case 'TOGGLE_PACKING_ITEM': return {
      ...state,
      packingItems: state.packingItems.map(p => p.id === action.payload ? { ...p, packed: !p.packed } : p),
    };
    case 'DELETE_PACKING_ITEM': return { ...state, packingItems: state.packingItems.filter(p => p.id !== action.payload) };
    case 'RESET_CHECKLIST': return {
      ...state,
      packingItems: state.packingItems.map(p => p.tripId === action.payload ? { ...p, packed: false } : p),
    };
    case 'ADD_NOTE': return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE': return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n) };
    case 'DELETE_NOTE': return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };
    case 'TOGGLE_SAVED_DESTINATION': {
      const user = { ...state.currentUser };
      const saved = user.savedDestinations || [];
      user.savedDestinations = saved.includes(action.payload)
        ? saved.filter(id => id !== action.payload)
        : [...saved, action.payload];
      return {
        ...state,
        currentUser: user,
        users: state.users.map(u => u.id === user.id ? user : u),
      };
    }
    case 'SUSPEND_USER': return {
      ...state,
      users: state.users.map(u => u.id === action.payload ? { ...u, suspended: !u.suspended } : u),
    };
    case 'COPY_TRIP': return {
      ...state,
      trips: [...state.trips, action.payload.trip],
      stops: [...state.stops, ...action.payload.stops],
      activities: [...state.activities, ...action.payload.activities],
    };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, toasts, addToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
