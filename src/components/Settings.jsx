import React, { useState } from 'react'

const STORAGE_KEY = 'ct_api_key'

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function NumberInput({ value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-20 text-center text-sm font-semibold text-white px-2 py-1.5 rounded-lg"
        style={{ background: '#1a1a1a', border: '1px solid #333' }}
      />
      {unit && <span className="text-xs text-gray-500">{unit}</span>}
    </div>
  )
}

export default function Settings({ settings, setSettings, clearAll, customFoods, setCustomFoods }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const handleSaveApiKey = () => {
    const trimmed = apiKey.trim()
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const handleClearAll = () => {
    clearAll()
    setShowConfirm(false)
  }

  const handleDeleteCustomFood = (id) => {
    setCustomFoods(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="tab-content pb-8">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-xs text-gray-500">Customize your targets</p>
      </div>

      {/* Targets */}
      <div className="mx-4 px-4 rounded-2xl mb-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <p className="text-xs font-semibold text-gray-500 pt-4 pb-1 uppercase tracking-wider">Daily Targets</p>

        <SettingRow label="Calories" description="Daily calorie goal">
          <NumberInput
            value={settings.dailyCaloriesTarget}
            onChange={v => update('dailyCaloriesTarget', v)}
            min={1000}
            max={6000}
            step={50}
            unit="kcal"
          />
        </SettingRow>

        <SettingRow label="Protein" description="Daily protein goal">
          <NumberInput
            value={settings.dailyProteinTarget}
            onChange={v => update('dailyProteinTarget', v)}
            min={20}
            max={400}
            step={5}
            unit="g"
          />
        </SettingRow>

        <div className="py-3">
          <p className="text-xs font-semibold text-gray-500 pb-3 uppercase tracking-wider">Weight Goals</p>

          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-white">Current Weight</p>
              <p className="text-xs text-gray-500 mt-0.5">Your starting weight</p>
            </div>
            <NumberInput
              value={settings.currentWeight}
              onChange={v => update('currentWeight', v)}
              min={20}
              max={300}
              step={0.5}
              unit="kg"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-white">Weekly Gain Target</p>
              <p className="text-xs text-gray-500 mt-0.5">Target weight gain per week</p>
            </div>
            <NumberInput
              value={settings.weeklyWeightGainTarget}
              onChange={v => update('weeklyWeightGainTarget', v)}
              min={-2}
              max={2}
              step={0.1}
              unit="kg/wk"
            />
          </div>
        </div>
      </div>

      {/* Custom Foods */}
      {customFoods.length > 0 && (
        <div className="mx-4 px-4 rounded-2xl mb-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-semibold text-gray-500 pt-4 pb-2 uppercase tracking-wider">
            Saved Foods ({customFoods.length})
          </p>
          <div className="space-y-1 pb-3">
            {customFoods.map(food => (
              <div key={food.id}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid #1a1a1a' }}>
                <div>
                  <p className="text-sm text-white">{food.name}</p>
                  <p className="text-xs text-gray-500">
                    {food.calories} kcal · P {food.protein_g}g · C {food.carbs_g}g · F {food.fat_g}g
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCustomFood(food.id)}
                  className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Key */}
      <div className="mx-4 px-4 py-4 rounded-2xl mb-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Claude API Key</p>
            <p className="text-xs text-gray-600 mt-0.5">Get yours at console.anthropic.com</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{
              background: (import.meta.env.VITE_CLAUDE_API_KEY || localStorage.getItem(STORAGE_KEY))
                ? '#22c55e' : '#ef4444'
            }} />
            <span className="text-xs text-gray-500">
              {(import.meta.env.VITE_CLAUDE_API_KEY || localStorage.getItem(STORAGE_KEY)) ? 'Set' : 'Not set'}
            </span>
          </div>
        </div>
        <div className="relative mb-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm text-white"
            style={{ background: '#1a1a1a', border: '1px solid #333', fontFamily: 'monospace' }}
          />
          <button
            onClick={() => setShowKey(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {showKey ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <button
          onClick={handleSaveApiKey}
          className="w-full py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: apiKeySaved ? '#22c55e22' : '#a855f722', color: apiKeySaved ? '#22c55e' : '#a855f7', border: `1px solid ${apiKeySaved ? '#22c55e33' : '#a855f733'}` }}>
          {apiKeySaved ? '✓ Saved' : 'Save API Key'}
        </button>
        <p className="text-xs text-gray-700 mt-2 text-center">Stored locally on your device only</p>
      </div>

      {/* Danger zone */}
      <div className="mx-4 px-4 py-4 rounded-2xl" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Data</p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444433' }}>
            Clear All Data
          </button>
        ) : (
          <div className="text-center">
            <p className="text-sm text-red-400 mb-3">This will delete all food logs, weight entries, and saved foods. Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#ef4444' }}>
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#222', color: '#999' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-700 mt-6">
        All data stored locally in your browser
      </p>
    </div>
  )
}
