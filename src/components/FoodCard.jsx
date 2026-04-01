import React, { useState } from 'react'

function NutriBadge({ label, value, unit = 'g', color }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold" style={{ color }}>{value}{unit}</span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  )
}

export default function FoodCard({ food, onConfirm, onDelete, onEdit, onSaveCustom, isPending = false, isLogged = false }) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ ...food })

  const handleEditSave = () => {
    onEdit?.({
      ...editData,
      calories: Number(editData.calories),
      protein_g: Number(editData.protein_g),
      carbs_g: Number(editData.carbs_g),
      fat_g: Number(editData.fat_g),
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl p-3 mb-2" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <input
          className="w-full bg-transparent text-white text-sm font-medium mb-2 border-b pb-1"
          style={{ borderColor: '#333' }}
          value={editData.name}
          onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
          placeholder="Food name"
        />
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { key: 'calories', label: 'Cal', unit: '' },
            { key: 'protein_g', label: 'Protein', unit: 'g' },
            { key: 'carbs_g', label: 'Carbs', unit: 'g' },
            { key: 'fat_g', label: 'Fat', unit: 'g' },
          ].map(({ key, label, unit }) => (
            <div key={key}>
              <label className="text-[10px] text-gray-500 block mb-0.5">{label}</label>
              <input
                type="number"
                className="w-full bg-transparent text-white text-sm text-center rounded px-1 py-0.5"
                style={{ border: '1px solid #333' }}
                value={editData[key]}
                onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))}
                min="0"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleEditSave}
            className="flex-1 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ background: '#a855f7' }}>
            Save
          </button>
          <button onClick={() => { setEditing(false); setEditData({ ...food }) }}
            className="flex-1 py-1.5 rounded-lg text-sm font-medium"
            style={{ background: '#222', color: '#999' }}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: '#1a1a1a', border: '1px solid #1e1e1e' }}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-white flex-1 mr-2">{food.name}</span>
        <span className="text-sm font-bold" style={{ color: '#a855f7' }}>{food.calories} kcal</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <NutriBadge label="Protein" value={food.protein_g} color="#06b6d4" />
          <NutriBadge label="Carbs" value={food.carbs_g} color="#eab308" />
          <NutriBadge label="Fat" value={food.fat_g} color="#f97316" />
        </div>

        <div className="flex gap-1">
          {!isLogged && (
            <button onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#666' }}
              title="Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
          {onSaveCustom && (
            <button onClick={() => onSaveCustom(food)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#666' }}
              title="Save as custom food">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#666' }}
              title="Delete">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          )}
          {isPending && onConfirm && (
            <button onClick={onConfirm}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white ml-1"
              style={{ background: '#a855f7' }}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function FoodCardSkeleton() {
  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: '#1a1a1a', border: '1px solid #1e1e1e' }}>
      <div className="flex justify-between mb-2">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="flex gap-4">
        <div className="skeleton h-8 w-16" />
        <div className="skeleton h-8 w-16" />
        <div className="skeleton h-8 w-16" />
      </div>
    </div>
  )
}
