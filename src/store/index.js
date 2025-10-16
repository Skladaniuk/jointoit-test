import { configureStore } from '@reduxjs/toolkit'
import eventsReducer from '../features/events/eventsSlice'

const STORAGE_KEY = 'calendar_events_v1'

export const store = configureStore({
  reducer: {
    events: eventsReducer,
  },
})


let t
store.subscribe(() => {
  clearTimeout(t)
  t = setTimeout(() => {
    try {
      const { events } = store.getState()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events.items))
    } catch {
      console.warn('Failed to save events to localStorage')
    }
  }, 150)
})