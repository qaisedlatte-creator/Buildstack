import { useState, useCallback, useRef } from 'react'
import { parseFoodResponse, FOOD_PARSE_SYSTEM_PROMPT, WEEKLY_FEEDBACK_SYSTEM_PROMPT } from '../utils/nutritionParser.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(systemPrompt, userMessage, apiKey, signal) {
  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('rate_limit')
    }
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

async function callClaudeWithRetry(systemPrompt, userMessage, apiKey, signal, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callClaude(systemPrompt, userMessage, apiKey, signal)
    } catch (err) {
      if (err.name === 'AbortError') throw err
      if (err.message === 'rate_limit' && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
        continue
      }
      throw err
    }
  }
}

export function useClaudeAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const getApiKey = () => {
    const key = import.meta.env.VITE_CLAUDE_API_KEY || localStorage.getItem('ct_api_key')
    if (!key) throw new Error('No API key — go to Settings and enter your Anthropic API key.')
    return key
  }

  const parseFood = useCallback(async (description, cachedResult) => {
    if (cachedResult) return { foods: cachedResult, fromCache: true }

    setIsLoading(true)
    setError(null)

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const apiKey = getApiKey()
      const text = await callClaudeWithRetry(
        FOOD_PARSE_SYSTEM_PROMPT,
        description,
        apiKey,
        abortRef.current.signal
      )
      const foods = parseFoodResponse(text)
      return { foods, fromCache: false }
    } catch (err) {
      if (err.name === 'AbortError') return null
      const message = err.message === 'rate_limit'
        ? 'Rate limited — please wait a moment and try again.'
        : err.message.includes('VITE_CLAUDE_API_KEY')
        ? err.message
        : "Couldn't parse — add manually."
      setError(message)
      return { foods: null, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getWeeklyFeedback = useCallback(async (weekData) => {
    setIsLoading(true)
    setError(null)

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const apiKey = getApiKey()
      const summary = JSON.stringify(weekData, null, 2)
      const text = await callClaudeWithRetry(
        WEEKLY_FEEDBACK_SYSTEM_PROMPT,
        `Here is my nutrition data for the past 7 days:\n${summary}\nGive me 2-3 specific actionable tips.`,
        apiKey,
        abortRef.current.signal
      )

      // Parse tips - try JSON first, fallback to splitting by newlines
      try {
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
        const tips = JSON.parse(cleaned)
        return Array.isArray(tips) ? tips : [text]
      } catch {
        return text.split('\n').filter(l => l.trim()).slice(0, 3)
      }
    } catch (err) {
      if (err.name === 'AbortError') return null
      const message = err.message.includes('VITE_CLAUDE_API_KEY')
        ? err.message
        : 'Failed to get AI feedback. Please try again.'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  return { parseFood, getWeeklyFeedback, isLoading, error, setError, cancel }
}
