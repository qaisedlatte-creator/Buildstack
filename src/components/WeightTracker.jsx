import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot
} from 'recharts'
import { getWeightStats, generateId, formatShortDate } from '../utils/calculations.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#1e1e1e', border: '1px solid #333' }}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0].value} kg</p>
    </div>
  )
}

export default function WeightTracker({ weightEntries, setWeightEntries, settings }) {
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')

  const stats = getWeightStats(weightEntries)
  const weightGoal = settings.weeklyWeightGainTarget || 0.5

  const handleAdd = () => {
    const w = parseFloat(weight)
    if (!w || w < 20 || w > 300) return

    const now = new Date()
    setWeightEntries(prev => [
      ...prev,
      {
        id: generateId(),
        weight: w,
        note: note.trim(),
        timestamp: now.getTime(),
        date: now.toISOString().split('T')[0],
      }
    ])
    setWeight('')
    setNote('')
  }

  const handleDelete = (id) => {
    setWeightEntries(prev => prev.filter(e => e.id !== id))
  }

  // Chart data — last 30 entries
  const sorted = [...weightEntries].sort((a, b) => a.timestamp - b.timestamp)
  const chartData = sorted.slice(-30).map(e => ({
    date: formatShortDate(e.date),
    weight: e.weight,
  }))

  const minWeight = chartData.length ? Math.min(...chartData.map(d => d.weight)) - 1 : 45
  const maxWeight = chartData.length ? Math.max(...chartData.map(d => d.weight)) + 1 : 65

  const isLosingWeight = stats?.rateOfChange !== null && stats?.rateOfChange < -0.2
  const isGainingTooFast = stats?.rateOfChange !== null && stats?.rateOfChange > weightGoal * 2

  return (
    <div className="tab-content pb-4">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-semibold text-white">Weight Tracker</h1>
        <p className="text-xs text-gray-500">Monitor your progress</p>
      </div>

      {/* Warning */}
      {isLosingWeight && (
        <div className="mx-4 mb-3 p-3 rounded-xl flex items-start gap-2"
          style={{ background: '#ef444415', border: '1px solid #ef444433' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-sm text-red-400">
            You're losing weight ({Math.abs(stats.rateOfChange)}kg/week). Eat more to meet your goal.
          </p>
        </div>
      )}

      {isGainingTooFast && (
        <div className="mx-4 mb-3 p-3 rounded-xl flex items-start gap-2"
          style={{ background: '#eab30815', border: '1px solid #eab30833' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm text-yellow-400">
            Gaining {stats.rateOfChange}kg/week — faster than your {weightGoal}kg/week target.
          </p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mx-4 flex gap-2 mb-3">
          <div className="flex-1 p-3 rounded-xl text-center" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            <div className="text-xl font-bold text-white">{stats.latest}</div>
            <div className="text-xs text-gray-500 mt-0.5">Current (kg)</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            <div className="text-xl font-bold text-white">{stats.weeklyAvg || '—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">Week Avg (kg)</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            <div className="text-xl font-bold" style={{
              color: stats.rateOfChange === null ? '#555'
                : stats.rateOfChange > 0 ? '#22c55e'
                : '#ef4444'
            }}>
              {stats.rateOfChange === null ? '—' : `${stats.rateOfChange > 0 ? '+' : ''}${stats.rateOfChange}`}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">kg/week</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="mx-4 p-4 rounded-2xl mb-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <p className="text-xs text-gray-500 mb-3">Weight Trend</p>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#555', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[minWeight, maxWeight]}
                  tick={{ fill: '#555', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={<Dot r={3} fill="#a855f7" strokeWidth={0} />}
                  activeDot={{ r: 5, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add weight */}
      <div className="mx-4 p-4 rounded-2xl mb-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <p className="text-sm font-medium text-white mb-3">Log Weight</p>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. 54.5"
              step="0.1"
              min="20"
              max="300"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white"
              style={{ background: '#1a1a1a', border: '1px solid #222' }}
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!weight}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{
            background: weight ? '#a855f7' : '#1a1a1a',
            color: weight ? 'white' : '#444',
          }}>
          Log Weight
        </button>
      </div>

      {/* History */}
      {weightEntries.length > 0 && (
        <div className="mx-4">
          <p className="text-xs text-gray-500 mb-2">Recent Entries</p>
          <div className="space-y-1">
            {[...weightEntries]
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 10)
              .map(entry => (
                <div key={entry.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                  <div>
                    <span className="text-sm font-semibold text-white">{entry.weight} kg</span>
                    {entry.note && <span className="text-xs text-gray-500 ml-2">{entry.note}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">{formatShortDate(entry.date)}</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
