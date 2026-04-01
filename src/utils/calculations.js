export function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export function getDateString(date) {
  return new Date(date).toISOString().split('T')[0]
}

export function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function sumNutrition(foods) {
  return foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein_g: acc.protein_g + (f.protein_g || 0),
      carbs_g: acc.carbs_g + (f.carbs_g || 0),
      fat_g: acc.fat_g + (f.fat_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )
}

export function getDayTotals(entries, dateStr) {
  const dayEntries = entries.filter(e => e.date === dateStr)
  const allFoods = dayEntries.flatMap(e => e.foods)
  return sumNutrition(allFoods)
}

export function getWeeklyStats(entries, settings) {
  const days = getLast7Days()
  const dailyData = days.map(date => {
    const totals = getDayTotals(entries, date)
    return { date, ...totals }
  })

  const daysWithData = dailyData.filter(d => d.calories > 0)
  const count = daysWithData.length || 1

  const avg = {
    calories: Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / count),
    protein_g: Math.round(daysWithData.reduce((s, d) => s + d.protein_g, 0) / count),
    carbs_g: Math.round(daysWithData.reduce((s, d) => s + d.carbs_g, 0) / count),
    fat_g: Math.round(daysWithData.reduce((s, d) => s + d.fat_g, 0) / count),
  }

  const proteinTarget = settings.dailyProteinTarget || 120
  const proteinHitDays = daysWithData.filter(d => d.protein_g >= proteinTarget).length

  return { dailyData, avg, proteinHitDays, totalDays: daysWithData.length }
}

export function getWeightStats(weightEntries) {
  if (!weightEntries.length) return null

  const sorted = [...weightEntries].sort((a, b) => a.timestamp - b.timestamp)
  const recent = sorted.slice(-7)

  const weeklyAvg = recent.length
    ? Math.round((recent.reduce((s, e) => s + e.weight, 0) / recent.length) * 10) / 10
    : null

  let rateOfChange = null
  if (sorted.length >= 2) {
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const weeks = (last.timestamp - first.timestamp) / (7 * 24 * 60 * 60 * 1000)
    if (weeks > 0) {
      rateOfChange = Math.round(((last.weight - first.weight) / weeks) * 10) / 10
    }
  }

  return { weeklyAvg, rateOfChange, latest: sorted[sorted.length - 1]?.weight }
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatShortDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export function getProgressColor(value, target) {
  const pct = (value / target) * 100
  if (pct >= 80) return '#22c55e'
  if (pct >= 50) return '#eab308'
  return '#ef4444'
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
