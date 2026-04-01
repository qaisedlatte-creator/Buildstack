import React, { useState, useRef, useEffect } from 'react'
import FoodCard, { FoodCardSkeleton } from './FoodCard.jsx'
import { generateId } from '../utils/calculations.js'

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

export default function ChatInput({
  onSaveEntry,
  onSaveCustomFood,
  customFoods,
  parseFood,
  isLoading,
  apiError,
  setApiError,
  getCached,
  setCached,
}) {
  const [text, setText] = useState('')
  const [meal, setMeal] = useState('Breakfast')
  const [pendingFoods, setPendingFoods] = useState([])
  const [showCustomFoods, setShowCustomFoods] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualFood, setManualFood] = useState({ name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
  const inputRef = useRef(null)
  const pendingRef = useRef(null)

  // Auto-set meal based on time
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 10) setMeal('Breakfast')
    else if (hour < 14) setMeal('Lunch')
    else if (hour < 18) setMeal('Snacks')
    else setMeal('Dinner')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setApiError(null)
    setManualMode(false)

    const cacheKey = trimmed.toLowerCase()
    const cached = getCached(cacheKey)

    const result = await parseFood(trimmed, cached)
    if (!result) return

    if (result.foods) {
      if (!result.fromCache) {
        setCached(cacheKey, result.foods)
      }
      setPendingFoods(result.foods.map(f => ({ ...f, id: generateId() })))
      setText('')
      setTimeout(() => pendingRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } else {
      // API failed — show manual mode
      setManualMode(true)
    }
  }

  const handleConfirmFood = (food) => {
    onSaveEntry({ meal, foods: [food] })
    setPendingFoods(prev => prev.filter(f => f.id !== food.id))
  }

  const handleConfirmAll = () => {
    if (!pendingFoods.length) return
    onSaveEntry({ meal, foods: pendingFoods })
    setPendingFoods([])
  }

  const handleEditPending = (id, updated) => {
    setPendingFoods(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f))
  }

  const handleDeletePending = (id) => {
    setPendingFoods(prev => prev.filter(f => f.id !== id))
  }

  const handleSaveCustom = (food) => {
    onSaveCustomFood({ ...food, id: generateId() })
  }

  const handleAddCustomFood = (food) => {
    onSaveEntry({ meal, foods: [food] })
    setShowCustomFoods(false)
  }

  const handleManualAdd = () => {
    const food = {
      id: generateId(),
      name: manualFood.name || 'Custom food',
      calories: Number(manualFood.calories) || 0,
      protein_g: Number(manualFood.protein_g) || 0,
      carbs_g: Number(manualFood.carbs_g) || 0,
      fat_g: Number(manualFood.fat_g) || 0,
    }
    onSaveEntry({ meal, foods: [food] })
    setManualFood({ name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
    setManualMode(false)
  }

  return (
    <div className="flex flex-col">
      {/* Pending foods */}
      {pendingFoods.length > 0 && (
        <div ref={pendingRef} className="px-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Parsed items — review & add</span>
            <button
              onClick={handleConfirmAll}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: '#a855f7', color: 'white' }}>
              Add All
            </button>
          </div>
          {pendingFoods.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              isPending
              onConfirm={() => handleConfirmFood(food)}
              onDelete={() => handleDeletePending(food.id)}
              onEdit={(updated) => handleEditPending(food.id, updated)}
              onSaveCustom={handleSaveCustom}
            />
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="px-4 pt-3">
          <FoodCardSkeleton />
          <FoodCardSkeleton />
        </div>
      )}

      {/* API Error */}
      {apiError && !manualMode && (
        <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <p className="text-sm text-red-400 mb-2">{apiError}</p>
          <button onClick={() => setManualMode(true)}
            className="text-xs text-purple-400 underline">
            Add manually instead
          </button>
        </div>
      )}

      {/* Manual input mode */}
      {manualMode && (
        <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Add manually</span>
            <button onClick={() => setManualMode(false)} className="text-gray-500 text-lg">×</button>
          </div>
          <input
            className="w-full bg-transparent text-white text-sm mb-2 px-2 py-1.5 rounded-lg"
            style={{ border: '1px solid #333' }}
            placeholder="Food name"
            value={manualFood.name}
            onChange={e => setManualFood(p => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { key: 'calories', label: 'Cal' },
              { key: 'protein_g', label: 'Protein' },
              { key: 'carbs_g', label: 'Carbs' },
              { key: 'fat_g', label: 'Fat' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-[10px] text-gray-500 block mb-0.5">{label}</label>
                <input
                  type="number" min="0"
                  className="w-full bg-transparent text-white text-sm text-center rounded px-1 py-1"
                  style={{ border: '1px solid #333' }}
                  value={manualFood[key]}
                  onChange={e => setManualFood(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <button onClick={handleManualAdd}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#a855f7' }}>
            Add Food
          </button>
        </div>
      )}

      {/* Custom foods quick-add */}
      {showCustomFoods && (
        <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Saved foods</span>
            <button onClick={() => setShowCustomFoods(false)} className="text-gray-500 text-lg">×</button>
          </div>
          {customFoods.length === 0 ? (
            <p className="text-xs text-gray-500">No saved foods yet. Use the save icon on any food card.</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {customFoods.map(food => (
                <button key={food.id}
                  onClick={() => handleAddCustomFood(food)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors"
                  style={{ background: '#222' }}>
                  <span className="text-sm text-white">{food.name}</span>
                  <span className="text-xs" style={{ color: '#a855f7' }}>{food.calories} kcal</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3" style={{ borderTop: '1px solid #1a1a1a' }}>
        {/* Meal selector */}
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5">
          {MEALS.map(m => (
            <button
              key={m}
              onClick={() => setMeal(m)}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: meal === m ? '#a855f7' : '#1a1a1a',
                color: meal === m ? 'white' : '#666',
                border: meal === m ? 'none' : '1px solid #222',
              }}>
              {m}
            </button>
          ))}
          <button
            onClick={() => setShowCustomFoods(p => !p)}
            className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ml-auto"
            style={{
              background: showCustomFoods ? '#06b6d422' : '#1a1a1a',
              color: showCustomFoods ? '#06b6d4' : '#666',
              border: `1px solid ${showCustomFoods ? '#06b6d4' : '#222'}`,
            }}>
            Saved
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. 2 chapati with dal and a glass of milk..."
            disabled={isLoading}
            className="flex-1 text-sm px-4 py-3 rounded-xl text-white placeholder-gray-600 transition-colors"
            style={{ background: '#1a1a1a', border: '1px solid #222' }}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="px-4 py-3 rounded-xl font-medium transition-all flex-shrink-0"
            style={{
              background: isLoading || !text.trim() ? '#1a1a1a' : '#a855f7',
              color: isLoading || !text.trim() ? '#444' : 'white',
            }}>
            {isLoading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
