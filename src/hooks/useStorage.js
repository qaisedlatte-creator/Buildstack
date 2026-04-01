import { useState, useEffect, useCallback } from 'react'

const KEYS = {
  ENTRIES: 'ct_entries',
  WEIGHT: 'ct_weight',
  SETTINGS: 'ct_settings',
  CUSTOM_FOODS: 'ct_custom_foods',
  PARSE_CACHE: 'ct_parse_cache',
}

const DEFAULT_SETTINGS = {
  dailyCaloriesTarget: 2500,
  dailyProteinTarget: 120,
  weeklyWeightGainTarget: 0.5,
  currentWeight: 54,
}

function load(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage write failed:', e)
  }
}

export function useStorage() {
  const [entries, setEntriesState] = useState(() => load(KEYS.ENTRIES, []))
  const [weightEntries, setWeightState] = useState(() => load(KEYS.WEIGHT, []))
  const [settings, setSettingsState] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...load(KEYS.SETTINGS, {}),
  }))
  const [customFoods, setCustomFoodsState] = useState(() => load(KEYS.CUSTOM_FOODS, []))

  const setEntries = useCallback(updater => {
    setEntriesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(KEYS.ENTRIES, next)
      return next
    })
  }, [])

  const setWeightEntries = useCallback(updater => {
    setWeightState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(KEYS.WEIGHT, next)
      return next
    })
  }, [])

  const setSettings = useCallback(updater => {
    setSettingsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(KEYS.SETTINGS, next)
      return next
    })
  }, [])

  const setCustomFoods = useCallback(updater => {
    setCustomFoodsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(KEYS.CUSTOM_FOODS, next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k))
    setEntriesState([])
    setWeightState([])
    setSettingsState(DEFAULT_SETTINGS)
    setCustomFoodsState([])
  }, [])

  // Parse cache helpers (not in React state — just localStorage)
  const getCached = useCallback(key => {
    const cache = load(KEYS.PARSE_CACHE, {})
    return cache[key] || null
  }, [])

  const setCached = useCallback((key, value) => {
    const cache = load(KEYS.PARSE_CACHE, {})
    // Keep cache under ~100 entries
    const keys = Object.keys(cache)
    if (keys.length > 100) {
      delete cache[keys[0]]
    }
    cache[key] = value
    save(KEYS.PARSE_CACHE, cache)
  }, [])

  return {
    entries,
    setEntries,
    weightEntries,
    setWeightEntries,
    settings,
    setSettings,
    customFoods,
    setCustomFoods,
    clearAll,
    getCached,
    setCached,
  }
}
