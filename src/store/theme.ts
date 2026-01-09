import { persistentAtom } from '@nanostores/persistent'

function initial(key, fallback) {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(key) || fallback
    } catch {}
  }
  return fallback // SSR
}

function cycle(list, current) {
  const i = list.indexOf(current)
  return list[(i + 1) % list.length]
}

// ----------------------------------------------------------------------- Day/Night mode
export const dayNightMode = persistentAtom(
  'dayNightMode',
  initial('dayNightMode', 'day')
)

export function setDayNightMode(mode) {
  dayNightMode.set(mode)
}
export function toggleDayNightMode() {
  const cur = dayNightMode.get()
  dayNightMode.set(cur === 'night' ? 'day' : 'night')
}
export function cycleDayNightMode(list = ['day', 'night']) {
  const next = cycle(list, dayNightMode.get())
  dayNightMode.set(next)
}

// -------------------------------------------------------------------------------- Theme
export const theme = persistentAtom('theme', 't-0')

export function setTheme(v) {
  theme.set(v)
}
export function cycleTheme(list = ['t-0', 't-1', 't-2', 't-3', 't-4', 't-5']) {
  theme.set(cycle(list, theme.get()))
}

// --------------------------------------------------------------------------------- Size
export const size = persistentAtom('size', 's-2')

export function setSize(v) {
  size.set(v)
}
export function cycleSize(list = ['s-1', 's-2', 's-3', 's-4', 's-5']) {
  size.set(cycle(list, size.get()))
}
