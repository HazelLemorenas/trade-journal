import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export function useInsights() {
  const { user } = useAuthStore()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchInsights()
  }, [user])

  const fetchInsights = async () => {
    setLoading(true)

    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'closed')

    if (!trades || trades.length === 0) {
      setInsights(null)
      setLoading(false)
      return
    }

    const tradeIds = trades.map(t => t.id)

    const [{ data: confluences }, { data: mistakes }, { data: psychology }] = await Promise.all([
      supabase.from('trade_confluences').select('*').in('trade_id', tradeIds),
      supabase.from('trade_mistakes').select('*').in('trade_id', tradeIds),
      supabase.from('trade_psychology').select('*').in('trade_id', tradeIds),
    ])

    // --- Best & Worst Setup ---
    const setupKeys = [
      { key: 'fair_value_gap', label: 'Fair Value Gap' },
      { key: 'order_block', label: 'Order Block' },
      { key: 'breaker', label: 'Breaker' },
      { key: 'mitigation_block', label: 'Mitigation Block' },
      { key: 'inversion_fvg', label: 'Inversion FVG' },
      { key: 'liquidity_void', label: 'Liquidity Void' },
      { key: 'mss', label: 'MSS' },
      { key: 'choch', label: 'CHoCH' },
      { key: 'bos', label: 'BOS' },
    ]

    const setupStats = setupKeys.map(({ key, label }) => {
      const matchingTradeIds = (confluences || [])
        .filter(c => c[key])
        .map(c => c.trade_id)
      const setupTrades = trades.filter(t => matchingTradeIds.includes(t.id))
      if (setupTrades.length < 2) return null
      const wins = setupTrades.filter(t => t.result === 'win').length
      const winRate = Number(((wins / setupTrades.length) * 100).toFixed(1))
      return { label, winRate, total: setupTrades.length }
    }).filter(Boolean)

    const bestSetup = setupStats.sort((a, b) => b.winRate - a.winRate)[0] || null
    const worstSetup = [...setupStats].sort((a, b) => a.winRate - b.winRate)[0] || null

    // --- Worst Mistake ---
    const mistakeKeys = [
      { key: 'entered_early', label: 'Entered Early' },
      { key: 'entered_late', label: 'Entered Late' },
      { key: 'ignored_bias', label: 'Ignored Bias' },
      { key: 'moved_stop_loss', label: 'Moved Stop Loss' },
      { key: 'moved_take_profit', label: 'Moved Take Profit' },
      { key: 'overleveraged', label: 'Overleveraged' },
      { key: 'revenge_trading', label: 'Revenge Trading' },
      { key: 'fomo_entry', label: 'FOMO Entry' },
      { key: 'emotional_decision', label: 'Emotional Decision' },
      { key: 'broke_trading_rules', label: 'Broke Trading Rules' },
    ]

    const mistakeStats = mistakeKeys.map(({ key, label }) => {
      const matchingTradeIds = (mistakes || [])
        .filter(m => m[key])
        .map(m => m.trade_id)
      const mistakeTrades = trades.filter(t => matchingTradeIds.includes(t.id))
      if (mistakeTrades.length === 0) return null
      const losses = mistakeTrades.filter(t => t.result === 'loss').length
      const lossRate = Number(((losses / mistakeTrades.length) * 100).toFixed(1))
      return { label, lossRate, total: mistakeTrades.length }
    }).filter(Boolean)

    const worstMistake = mistakeStats.sort((a, b) => b.lossRate - a.lossRate)[0] || null
    const mostFrequentMistake = [...(mistakeStats)].sort((a, b) => b.total - a.total)[0] || null

    // --- Best Session ---
    const sessions = ['Asia', 'London', 'New York']
    const sessionStats = sessions.map(session => {
      const sessionTrades = trades.filter(t => t.session === session)
      if (sessionTrades.length === 0) return null
      const rrs = sessionTrades.filter(t => t.rr_achieved != null).map(t => Number(t.rr_achieved))
      const avgRR = rrs.length > 0
        ? Number((rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2))
        : 0
      const wins = sessionTrades.filter(t => t.result === 'win').length
      const winRate = Number(((wins / sessionTrades.length) * 100).toFixed(1))
      return { session, avgRR, winRate, total: sessionTrades.length }
    }).filter(Boolean)

    const bestSession = sessionStats.sort((a, b) => b.avgRR - a.avgRR)[0] || null

    // --- Best Day of Week ---
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayMap = {}
    trades.forEach(t => {
      if (!t.trade_date) return
      const day = days[new Date(t.trade_date).getDay()]
      if (!dayMap[day]) dayMap[day] = { wins: 0, total: 0, pnl: 0 }
      dayMap[day].total++
      if (t.result === 'win') dayMap[day].wins++
      if (t.pnl_amount != null) dayMap[day].pnl += Number(t.pnl_amount)
    })

    const dayStats = Object.entries(dayMap).map(([day, d]) => ({
      day,
      winRate: Number(((d.wins / d.total) * 100).toFixed(1)),
      total: d.total,
      pnl: Number(d.pnl.toFixed(2)),
    }))

    const bestDay = dayStats.sort((a, b) => b.winRate - a.winRate)[0] || null

    // --- Most Profitable Pair ---
    const pairMap = {}
    trades.forEach(t => {
      if (!t.pair || t.pnl_amount == null) return
      if (!pairMap[t.pair]) pairMap[t.pair] = { pnl: 0, total: 0, wins: 0 }
      pairMap[t.pair].pnl += Number(t.pnl_amount)
      pairMap[t.pair].total++
      if (t.result === 'win') pairMap[t.pair].wins++
    })

    const pairStats = Object.entries(pairMap).map(([pair, p]) => ({
      pair,
      pnl: Number(p.pnl.toFixed(2)),
      total: p.total,
      winRate: Number(((p.wins / p.total) * 100).toFixed(1)),
    }))

    const mostProfitablePair = pairStats.sort((a, b) => b.pnl - a.pnl)[0] || null
    const leastProfitablePair = [...pairStats].sort((a, b) => a.pnl - b.pnl)[0] || null

    // --- Psychology Patterns ---
    const highFearLosses = trades.filter(t => {
      const psych = (psychology || []).find(p => p.trade_id === t.id)
      return psych && psych.before_fear >= 7 && t.result === 'loss'
    }).length

    const highConfidenceWins = trades.filter(t => {
      const psych = (psychology || []).find(p => p.trade_id === t.id)
      return psych && psych.before_confidence >= 7 && t.result === 'win'
    }).length

    const overconfidentLosses = trades.filter(t => {
      const psych = (psychology || []).find(p => p.trade_id === t.id)
      return psych && psych.before_emotion === 'overconfident' && t.result === 'loss'
    }).length

    const calmWins = trades.filter(t => {
      const psych = (psychology || []).find(p => p.trade_id === t.id)
      return psych && psych.before_emotion === 'calm' && t.result === 'win'
    }).length

    const calmTrades = trades.filter(t => {
      const psych = (psychology || []).find(p => p.trade_id === t.id)
      return psych && psych.before_emotion === 'calm'
    }).length

    const calmWinRate = calmTrades > 0
      ? Number(((calmWins / calmTrades) * 100).toFixed(1))
      : 0

    // --- Bias Accuracy ---
    const biasedTrades = trades.filter(t => t.daily_bias && t.daily_bias !== 'neutral')
    const correctBias = biasedTrades.filter(t =>
      (t.daily_bias === 'bullish' && t.direction === 'long' && t.result === 'win') ||
      (t.daily_bias === 'bearish' && t.direction === 'short' && t.result === 'win')
    ).length
    const biasAccuracy = biasedTrades.length > 0
      ? Number(((correctBias / biasedTrades.length) * 100).toFixed(1))
      : 0

    // --- Day Stats for Chart ---
    const dayChartData = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .map(day => {
        const d = dayMap[day]
        if (!d) return { day: day.slice(0, 3), winRate: 0, total: 0 }
        return {
          day: day.slice(0, 3),
          winRate: Number(((d.wins / d.total) * 100).toFixed(1)),
          total: d.total,
        }
      })

    setInsights({
      totalTrades: trades.length,
      bestSetup,
      worstSetup,
      worstMistake,
      mostFrequentMistake,
      bestSession,
      sessionStats,
      bestDay,
      dayChartData,
      mostProfitablePair,
      leastProfitablePair,
      pairStats,
      highFearLosses,
      highConfidenceWins,
      overconfidentLosses,
      calmWinRate,
      calmTrades,
      biasAccuracy,
      biasedTrades: biasedTrades.length,
      mistakeStats,
    })

    setLoading(false)
  }

  return { insights, loading }
}