import React, { useState } from 'react'
import { getTodayString, getDayTotals, getProgressColor, formatDate } from '../utils/calculations.js'
import FoodCard from './FoodCard.jsx'

function CircularProgress({ value, max, size = 130, label, unit = '' }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference - progress * circumference
  const color = getProgressColor(value, max)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#1e1e1e" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{Math.round(value)}</span>
          <span className="text-[10px] text-gray-500">/ {max}{unit}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-1.5">{label}</span>
    </div>
  )
}

function MacroBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium" style={{ color }}>{Math.round(value)}g <span className="text-gray-600">/ {max}g</span></span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#1e1e1e' }}>
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function MealSection({ meal, foods, onDeleteFood }) {
  const [expanded, setExpanded] = useState(true)
  const total = foods.reduce((s, f) => s + (f.calories || 0), 0)

  return (
    <div className="mb-3">
      <button
        className="w-full flex items-center justify-between px-4 py-2"
        onClick={() => setExpanded(p => !p)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{meal}</span>
          <span className="text-xs text-gray-500">{foods.length} items</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#a855f7' }}>{total} kcal</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#555" strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>
      {expanded && foods.length > 0 && (
        <div className="px-4">
          {foods.map((food, idx) => (
            <FoodCard
              key={idx}
              food={food}
              isLogged
              onDelete={() => onDeleteFood(meal, idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DailyDashboard({ entries, settings, onDeleteFood, onNavigateToLog }) {
  const today = getTodayString()
  const todayEntries = entries.filter(e => e.date === today)
  const totals = getDayTotals(entries, today)

  const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
  const mealFoods = {}
  MEALS.forEach(m => {
    mealFoods[m] = todayEntries.filter(e => e.meal === m).flatMap(e => e.foods)
  })

  const calorieTarget = settings.dailyCaloriesTarget || 2500
  const proteinTarget = settings.dailyProteinTarget || 120
  const carbTarget = Math.round(calorieTarget * 0.5 / 4)
  const fatTarget = Math.round(calorieTarget * 0.3 / 9)

  const remaining = calorieTarget - totals.calories

  return (
    <div className="tab-content pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-semibold text-white">Today</h1>
        <p className="text-xs text-gray-500">{formatDate(today)}</p>
      </div>

      {/* Progress rings */}
      <div className="mx-4 p-4 rounded-2xl mb-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <div className="flex justify-around mb-4">
          <CircularProgress value={totals.calories} max={calorieTarget} label="Calories" unit=" kcal" size={130} />
          <CircularProgress value={totals.protein_g} max={proteinTarget} label="Protein" unit="g" size={130} />
        </div>

        {/* Remaining calories */}
        <div className="text-center mb-4">
          <span className="text-sm" style={{ color: remaining >= 0 ? '#22c55e' : '#ef4444' }}>
            {remaining >= 0
              ? `${remaining} kcal remaining`
              : `${Math.abs(remaining)} kcal over target`}
          </span>
        </div>

        {/* Macro bars */}
        <MacroBar label="Carbs" value={totals.carbs_g} max={carbTarget} color="#eab308" />
        <MacroBar label="Fat" value={totals.fat_g} max={fatTarget} color="#f97316" />
      </div>

      {/* Quick add button */}
      <div className="px-4 mb-3">
        <button
          onClick={onNavigateToLog}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: '#a855f722', color: '#a855f7', border: '1px solid #a855f733' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Log Food
        </button>
      </div>

      {/* Meal breakdown */}
      <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        {MEALS.map(meal => {
          const foods = mealFoods[meal]
          if (foods.length === 0) return null
          return (
            <MealSection
              key={meal}
              meal={meal}
              foods={foods}
              onDeleteFood={(m, idx) => onDeleteFood(today, m, idx)}
            />
          )
        })}
        {todayEntries.length === 0 && (
          <div className="py-8 text-center text-gray-600 text-sm">
            No food logged today.<br />
            <button onClick={onNavigateToLog} className="mt-1 underline" style={{ color: '#a855f7' }}>
              Start logging
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
