import { createSlice, nanoid } from '@reduxjs/toolkit'

const STORAGE_KEY = 'calendar_events_v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const initialState = {
  items: load(),
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: {
      prepare: (evt) => ({ payload: { id: evt?.id ?? nanoid(), ...evt } }),
      reducer: (state, action) => {
        state.items.push(action.payload)
      },
    },
    updateEvent: (state, action) => {
      const { id, ...rest } = action.payload
      const idx = state.items.findIndex((e) => e.id === id)
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...rest }
    },
    deleteEvent: (state, action) => {
      state.items = state.items.filter((e) => e.id !== action.payload)
    },
    setEvents: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : []
    },
    clearAll: (state) => {
      state.items = []
    },
  },
})

export const { addEvent, updateEvent, deleteEvent, setEvents, clearAll } = eventsSlice.actions
export default eventsSlice.reducer
