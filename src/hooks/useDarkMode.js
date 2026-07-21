import { useSyncExternalStore } from 'react'

function subscribe(cb) {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

export function useDarkMode() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}