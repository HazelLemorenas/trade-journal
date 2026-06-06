import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export function useDashboardStats() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    setLoading(true)

    // Fetch all closed trades
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'closed')

    if (!trades || trades.length === 0) {
      setStats(null)
      setLoading(false)
      return
    }

    // Fetch all confluences for these trades
    const tradeIds = trades.map(t => t.id)
    const { data: confluences } = await supabase
      .from('trade_confluences')
      .select('*')
      .in('trade_id', tradeIds)

    // --- Core Counts ---
    const total = trades.length
    const wins = trades.filter(t => t.result === 'win').length
    const losses = trades.filter(t => t.result === 'loss').length
    const breakevens = trades.filter(t => t.result === 'breakeven').length

    const winRate = ((wins / total) * 100).toFixed(1)
    const lossRate = ((losses / total) * 100).toFixed(1)
    const breakevenRate = ((breakevens / total) * 100).toFixed(1)

    // --- Average RR ---
    const rrValues = trades.filter(t => t.rr_achieved != null).map(t => Number(t.rr_achieved))
    const avgRR = rrValues.length > 0
      ? (rrValues.reduce((a, b) => a + b, 0) / rrValues.length).toFixed(2)
      : '0.00'

    // --- Average Hold Time ---
    const holdValues = trades.filter(t => t.hold_duration_minutes != null).map(t => t.hold_duration_minutes)
    const avgHold = holdValues.length > 0
      ? Math.round(holdValues.reduce((a, b) => a + b, 0) / holdValues.length)
      : 0

    const formatHold = (mins) => {
      if (mins < 60) return `${mins}m`
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    }

    // --- Profit Factor ---
    const grossProfit = trades.filter(t => t.pnl_amount > 0).reduce((a, t) => a + Number(t.pnl_amount), 0)
    const grossLoss = Math.abs(trades.filter(t => t.pnl_amount < 0).reduce((a, t) => a + Number(t.pnl_amount), 0))
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00'

    // --- Account Growth ---
    const { data: profile } = await supabase
      .from('profiles')
      .select('starting_balance, current_balance')
      .eq('id', user.id)
      .single()

    let accountGrowth = '0.00'
    if (profile?.starting_balance && profile?.current_balance) {
      accountGrowth = (((profile.current_balance - profile.starting_balance) / profile.starting_balance) * 100).toFixed(2)
    }

    // --- Monthly Performance ---
    const monthlyMap = {}
    trades.forEach(t => {
      if (!t.trade_date || t.pnl_amount == null) return
      const month = new Date(t.trade_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (!monthlyMap[month]) monthlyMap[month] = 0
      monthlyMap[month] += Number(t.pnl_amount)
    })
    const monthlyData = Object.entries(monthlyMap).map(([month, pnl]) => ({
      month,
      pnl: Number(pnl.toFixed(2)),
    }))

    // --- Win/Loss Pie ---
    const winLossData = [
      { name: 'Win', value: wins },
      { name: 'Loss', value: losses },
      { name: 'Break Even', value: breakevens },
    ].filter(d => d.value > 0)

    // --- Setup Performance ---
    const setupKeys = [
      { key: 'fair_value_gap', label: 'FVG' },
      { key: 'order_block', label: 'OB' },
      { key: 'breaker', label: 'Breaker' },
      { key: 'mss', label: 'MSS' },
      { key: 'choch', label: 'CHoCH' },
      { key: 'bos', label: 'BOS' },
      { key: 'inversion_fvg', label: 'Inv FVG' },
      { key: 'mitigation_block', label: 'Mitigation' },
    ]

    const setupData = setupKeys.map(({ key, label }) => {
      const matchingTradeIds = (confluences || [])
        .filter(c => c[key])
        .map(c => c.trade_id)

      const setupTrades = trades.filter(t => matchingTradeIds.includes(t.id))
      if (setupTrades.length === 0) return null

      const setupWins = setupTrades.filter(t => t.result === 'win').length
      const winRate = Number(((setupWins / setupTrades.length) * 100).toFixed(1))

      return { setup: label, winRate, total: setupTrades.length }
    }).filter(Boolean)

    // --- Session Performance ---
    const sessions = ['Asia', 'London', 'New York']
    const sessionData = sessions.map(session => {
      const sessionTrades = trades.filter(t => t.session === session)
      if (sessionTrades.length === 0) return null
      const rrs = sessionTrades.filter(t => t.rr_achieved != null).map(t => Number(t.rr_achieved))
      const avgRR = rrs.length > 0
        ? Number((rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2))
        : 0
      return { session, avgRR, total: sessionTrades.length }
    }).filter(Boolean)

    // --- Pair Performance ---
    const pairMap = {}
    trades.forEach(t => {
      if (!t.pair || t.pnl_amount == null) return
      if (!pairMap[t.pair]) pairMap[t.pair] = 0
      pairMap[t.pair] += Number(t.pnl_amount)
    })
    const pairData = Object.entries(pairMap)
      .map(([pair, pnl]) => ({ pair, pnl: Number(pnl.toFixed(2)) }))
      .sort((a, b) => b.pnl - a.pnl)

    // --- Equity Curve ---
    const sorted = [...trades].sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date))
    let cumulative = 0
    const equityCurve = sorted
      .filter(t => t.pnl_amount != null)
      .map((t, i) => {
        cumulative += Number(t.pnl_amount)
        return { trade: i + 1, pnl: Number(cumulative.toFixed(2)) }
      })

    setStats({
      total,
      wins,
      losses,
      breakevens,
      winRate,
      lossRate,
      breakevenRate,
      avgRR,
      avgHold: formatHold(avgHold),
      profitFactor,
      accountGrowth,
      monthlyData,
      winLossData,
      setupData,
      sessionData,
      pairData,
      equityCurve,
    })

    setLoading(false)
  }

  return { stats, loading, refetch: fetchStats }
}