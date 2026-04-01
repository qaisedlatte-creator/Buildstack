/**
 * Parse Claude API response into array of food items.
 * Handles both clean JSON and markdown-wrapped responses.
 */
export function parseFoodResponse(text) {
  if (!text) throw new Error('Empty response')

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  if (!Array.isArray(parsed)) {
    throw new Error('Response is not an array')
  }

  return parsed.map(item => ({
    name: String(item.name || 'Unknown food'),
    calories: Math.round(Number(item.calories) || 0),
    protein_g: Math.round((Number(item.protein_g) || 0) * 10) / 10,
    carbs_g: Math.round((Number(item.carbs_g) || 0) * 10) / 10,
    fat_g: Math.round((Number(item.fat_g) || 0) * 10) / 10,
  }))
}

export const FOOD_PARSE_SYSTEM_PROMPT = `You are a nutritionist. Parse food descriptions into JSON. Return ONLY a JSON array of items, each with: name (string), calories (number), protein_g (number), carbs_g (number), fat_g (number). Use Indian food database knowledge. Be accurate for South Indian and Kerala foods. No explanation, no markdown, just JSON.`

export const WEEKLY_FEEDBACK_SYSTEM_PROMPT = `You are a nutritionist coach. Analyze the weekly food and nutrition data and provide 2-3 specific, actionable tips. Be direct and specific — mention actual numbers from the data. Format as a JSON array of strings, each string being one tip. No markdown, just JSON array.`
