import React, { useState, useCallback } from 'react'
import Navigation from './components/Navigation.jsx'
import DailyDashboard from './components/DailyDashboard.jsx'
import ChatInput from './components/ChatInput.jsx'
import WeeklySummary from './components/WeeklySummary.jsx'
import WeightTracker from './components/WeightTracker.jsx'
import Settings from './components/Settings.jsx'
import FoodCard from './components/FoodCard.jsx'
import { useStorage } from './hooks/useStorage.js'
import { useClaudeAPI } from './hooks/useClaudeAPI.js'
import { getTodayString, generateId } from './utils/calculations.js'

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

function FoodLogTab({
  entries, settings, customFoods, onSaveEntry, onSaveCustomFood, onDeleteFood,
  parseFood, isLoading, apiError, setApiError, getCached, setCached,
}) {
  const today = getTodayString()
  const todayEntries = entries.filter(e => e.date === today)

  return (
    <div className="tab-content flex flex-col h-full">
      {/* Scrollable logged food area */}
      <div className="flex-1 overflow-y-auto pb-2">
        {todayEntries.length > 0 && (
          <div className="px-4 pt-4">
            <p className="text-xs text-gray-500 mb-3 font-medium">Today's log</p>
            {MEALS.map(meal => {
              const mealEntries = todayEntries.filter(e => e.meal === meal)
              if (!mealEntries.length) return null
              return (
                <div key={meal} className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{meal}</p>
                  {mealEntries.map((entry, entryIdx) =>
                    entry.foods.map((food, foodIdx) => (
                      <FoodCard
                        key={`${entry.id}-${foodIdx}`}
                        food={food}
                        isLogged
                        onDelete={() => onDeleteFood(today, meal, entry.id, foodIdx)}
                      />
                    ))
                  )}
                </div>
              )
            })}
          </div>
        )}
        {todayEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 px-8 text-center">
            <div className="text-4xl mb-3">🥗</div>
            <p className="text-gray-500 text-sm">Type what you ate below</p>
            <p className="text-gray-600 text-xs mt-1">e.g. "3 idli with sambar and coconut chutney"</p>
          </div>
        )}
      </div>

      {/* Chat input fixed at bottom of tab */}
      <div style={{ borderTop: '1px solid #1a1a1a' }}>
        <ChatInput
          onSaveEntry={onSaveEntry}
          onSaveCustomFood={onSaveCustomFood}
          customFoods={customFoods}
          parseFood={parseFood}
          isLoading={isLoading}
          apiError={apiError}
          setApiError={setApiError}
          getCached={getCached}
          setCached={setCached}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const {
    entries, setEntries,
    weightEntries, setWeightEntries,
    settings, setSettings,
    customFoods, setCustomFoods,
    clearAll, getCached, setCached,
  } = useStorage()

  const { parseFood, getWeeklyFeedback, isLoading, error: apiError, setError: setApiError } = useClaudeAPI()

  const handleSaveEntry = useCallback(({ meal, foods }) => {
    const today = getTodayString()
    setEntries(prev => [
      ...prev,
      {
        id: generateId(),
        date: today,
        meal,
        foods,
        timestamp: Date.now(),
      }
    ])
  }, [setEntries])

  const handleSaveCustomFood = useCallback((food) => {
    // Avoid duplicates by name
    setCustomFoods(prev => {
      if (prev.some(f => f.name.toLowerCase() === food.name.toLowerCase())) return prev
      return [...prev, { ...food, id: generateId() }]
    })
  }, [setCustomFoods])

  const handleDeleteFood = useCallback((date, meal, entryId, foodIdx) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry
      const newFoods = entry.foods.filter((_, i) => i !== foodIdx)
      if (newFoods.length === 0) return null
      return { ...entry, foods: newFoods }
    }).filter(Boolean))
  }, [setEntries])

  // For dashboard delete (uses old signature: date, meal, idx within meal)
  const handleDeleteFoodFromDashboard = useCallback((date, meal, idx) => {
    // Find all entries for this date/meal, delete by index across them
    let counter = 0
    setEntries(prev => {
      const result = []
      for (const entry of prev) {
        if (entry.date !== date || entry.meal !== meal) {
          result.push(entry)
          continue
        }
        const newFoods = entry.foods.filter((_, i) => {
          const globalIdx = counter + i
          return globalIdx !== idx
        })
        counter += entry.foods.length
        if (newFoods.length > 0) result.push({ ...entry, foods: newFoods })
      }
      return result
    })
  }, [setEntries])

  const navigateToLog = () => setActiveTab('log')

  const tabContentStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // 64px nav + iPhone home indicator safe area
    bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
  }

  return (
    <div style={{
      background: '#0a0a0a',
      height: '100dvh',
      position: 'relative',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      overflow: 'hidden',
    }}>
      {/* Tab content */}
      <div style={tabContentStyle}>
        {activeTab === 'dashboard' && (
          <DailyDashboard
            entries={entries}
            settings={settings}
            onDeleteFood={handleDeleteFoodFromDashboard}
            onNavigateToLog={navigateToLog}
          />
        )}
        {activeTab === 'log' && (
          <FoodLogTab
            entries={entries}
            settings={settings}
            customFoods={customFoods}
            onSaveEntry={handleSaveEntry}
            onSaveCustomFood={handleSaveCustomFood}
            onDeleteFood={handleDeleteFood}
            parseFood={parseFood}
            isLoading={isLoading}
            apiError={apiError}
            setApiError={setApiError}
            getCached={getCached}
            setCached={setCached}
          />
        )}
        {activeTab === 'weekly' && (
          <WeeklySummary
            entries={entries}
            settings={settings}
            getWeeklyFeedback={getWeeklyFeedback}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'weight' && (
          <WeightTracker
            weightEntries={weightEntries}
            setWeightEntries={setWeightEntries}
            settings={settings}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            clearAll={clearAll}
            customFoods={customFoods}
            setCustomFoods={setCustomFoods}
          />
        )}
      </div>

      {/* Bottom navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
