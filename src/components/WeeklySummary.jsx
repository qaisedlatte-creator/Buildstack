import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { getWeeklyStats, formatShortDate, getProgressColor } from '../utils/calculations.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#1e1e1e', border: '1px solid #333' }}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-semibold text-white">{Math.round(payload[0].value)} kcal</p>
    </div>
  )
}

function StatCard({ label, value, unit = '', color }) {
  return (
    <div className="flex-1 p-3 rounded-xl" style={{ background: '#1a1a1a' }}>
      <div className="text-lg font-bold" style={{ color: color || 'white' }}>
        {value}<span className="text-xs font-normal text-gray-500 ml-0.5">{unit}</span>
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

export default function WeeklySummary({ entries, settings, getWeeklyFeedback, isLoading }) {
  const [tips, setTips] = useState(null)
  const [loadingTips, setLoadingTips] = useState(false)

  const { dailyData, avg, proteinHitDays, totalDays } = getWeeklyStats(entries, settings)
  const calorieTarget = settings.dailyCaloriesTarget || 2500

  const chartData = dailyData.map(d => ({
    date: formatShortDate(d.date),
    calories: d.calories,
    fullDate: d.date,
  }))

  const handleGetFeedback = async () => {
    setLoadingTips(true)
    const weekSummary = {
      dailyData,
      averages: avg,
      targets: {
        calories: calorieTarget,
        protein: settings.dailyProteinTarget || 120,
      },
      proteinTargetHitDays: `${proteinHitDays} out of ${totalDays}`,
    }
    const result = await getWeeklyFeedback(weekSummary)
    setLoadingTips(false)
    if (result) setTips(result)
  }

  const proteinTarget = settings.dailyProteinTarget || 120

  return (
    <div className="tab-content pb-4">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-semibold text-white">Weekly Summary</h1>
        <p className="text-xs text-gray-500">Past 7 days</p>
      </div>

      {/* Bar chart */}
      <div className="mx-4 p-4 rounded-2xl mb-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <p className="text-xs text-gray-500 mb-3">Daily Calories</p>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis
                dataKey="date"
                tick={{ fill: '#555', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, Math.max(calorieTarget * 1.2, 500)]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
              <ReferenceLine
                y={calorieTarget}
                stroke="#a855f733"
                strokeDasharray="4 4"
              />
              <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.calories > 0
                      ? getProgressColor(entry.calories, calorieTarget)
                      : '#222'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-6 h-0.5" style={{ background: '#a855f733', borderTop: '1px dashed #a855f7' }} />
          <span className="text-[10px] text-gray-600">Target: {calorieTarget} kcal</span>
        </div>
      </div>

      {/* Averages */}
      <div className="mx-4 mb-3">
        <p className="text-xs text-gray-500 mb-2">Daily Averages</p>
        <div className="flex gap-2">
          <StatCard label="Calories" value={avg.calories} unit="kcal" color="#a855f7" />
          <StatCard label="Protein" value={avg.protein_g} unit="g" color="#06b6d4" />
        </div>
        <div className="flex gap-2 mt-2">
          <StatCard label="Carbs" value={avg.carbs_g} unit="g" color="#eab308" />
          <StatCard label="Fat" value={avg.fat_g} unit="g" color="#f97316" />
        </div>
      </div>

      {/* Protein target hit rate */}
      <div className="mx-4 p-3 rounded-xl mb-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Protein Target Hit</p>
            <p className="text-xs text-gray-500 mt-0.5">≥{proteinTarget}g days</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold" style={{ color: '#06b6d4' }}>{proteinHitDays}</span>
            <span className="text-gray-500 text-sm"> / {totalDays}</span>
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full" style={{ background: '#1e1e1e' }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: totalDays > 0 ? `${(proteinHitDays / totalDays) * 100}%` : '0%',
              background: '#06b6d4',
            }} />
        </div>
      </div>

      {/* AI Feedback */}
      <div className="mx-4 p-4 rounded-2xl" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">AI Nutritionist Feedback</p>
            <p className="text-xs text-gray-500 mt-0.5">Personalized tips for this week</p>
          </div>
          <button
            onClick={handleGetFeedback}
            disabled={loadingTips || totalDays === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
            style={{
              background: loadingTips ? '#222' : '#a855f722',
              color: loadingTips ? '#666' : '#a855f7',
              border: '1px solid #a855f733',
            }}>
            {loadingTips ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Loading
              </span>
            ) : 'Get Tips'}
          </button>
        </div>

        {tips ? (
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-2 p-2.5 rounded-lg" style={{ background: '#1a1a1a' }}>
                <span className="text-purple-400 mt-0.5 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/>
                  </svg>
                </span>
                <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        ) : totalDays === 0 ? (
          <p className="text-xs text-gray-600 text-center py-2">Log food for at least one day to get feedback</p>
        ) : (
          <p className="text-xs text-gray-600 text-center py-2">Press "Get Tips" to get AI-powered nutrition advice</p>
        )}
      </div>
    </div>
  )
}
