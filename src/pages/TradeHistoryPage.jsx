import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import MainLayout from '../layouts/MainLayout'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS_PER_PAGE = 10

const RESULT_COLORS = {
  win: 'text-[#22C55E] bg-[#22C55E]/10',
  loss: 'text-[#EF4444] bg-[#EF4444]/10',
  breakeven: 'text-yellow-400 bg-yellow-400/10',
}

const DIRECTION_COLORS = {
  long: 'text-[#22C55E] bg-[#22C55E]/10',
  short: 'text-[#EF4444] bg-[#EF4444]/10',
}

export default function TradeHistoryPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [filterSession, setFilterSession] = useState('')
  const [filterDirection, setFilterDirection] = useState('')
  const [filterTimeframe, setFilterTimeframe] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Sorting
  const [sortKey, setSortKey] = useState('trade_date')
  const [sortDir, setSortDir] = useState('desc')

  // Pagination
  const [page, setPage] = useState(1)

  const fetchTrades = async () => {
    setLoading(true)

    let query = supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (search) query = query.ilike('pair', `%${search}%`)
    if (filterResult) query = query.eq('result', filterResult)
    if (filterSession) query = query.eq('session', filterSession)
    if (filterDirection) query = query.eq('direction', filterDirection)
    if (filterTimeframe) query = query.eq('timeframe', filterTimeframe)
    if (dateFrom) query = query.gte('trade_date', dateFrom)
    if (dateTo) query = query.lte('trade_date', dateTo)

    query = query.order(sortKey, { ascending: sortDir === 'asc' })

    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (!error) {
      setTrades(data)
      setTotalCount(count)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTrades()
  }, [search, filterResult, filterSession, filterDirection, filterTimeframe, dateFrom, dateTo, sortKey, sortDir, page])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(1)
  }

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={14} className="text-slate-600" />
    return sortDir === 'asc'
      ? <ChevronUp size={14} className="text-[#22C55E]" />
      : <ChevronDown size={14} className="text-[#22C55E]" />
  }

  const getSetup = (trade) => {
    if (!trade) return '—'
    const setups = []
    if (trade.fair_value_gap) setups.push('FVG')
    if (trade.order_block) setups.push('OB')
    if (trade.breaker) setups.push('Breaker')
    if (trade.mss) setups.push('MSS')
    if (trade.choch) setups.push('CHoCH')
    if (trade.bos) setups.push('BOS')
    return setups.length > 0 ? setups.join(', ') : '—'
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Trade History</h2>
            <p className="text-slate-400 text-sm mt-1">{totalCount} trades recorded</p>
          </div>
          <button
            onClick={() => navigate('/trades/new')}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            + New Trade
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#1E293B] rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-4 gap-4 mb-4">

            {/* Search */}
            <div className="relative col-span-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by pair (e.g. BTC/USDT)"
                value={search}
                onChange={handleFilterChange(setSearch)}
                className="w-full bg-[#0F172A] text-white rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition"
              />
            </div>

            {/* Date From */}
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={handleFilterChange(setDateFrom)}
                className="w-full bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition"
              />
            </div>

            {/* Date To */}
            <div>
              <input
                type="date"
                value={dateTo}
                onChange={handleFilterChange(setDateTo)}
                className="w-full bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <select
              value={filterResult}
              onChange={handleFilterChange(setFilterResult)}
              className="bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition"
            >
              <option value="">All Results</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Break Even</option>
            </select>

            <select
              value={filterSession}
              onChange={handleFilterChange(setFilterSession)}
              className="bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition"
            >
              <option value="">All Sessions</option>
              <option value="Asia">Asia</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
            </select>

            <select
              value={filterDirection}
              onChange={handleFilterChange(setFilterDirection)}
              className="bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition"
            >
              <option value="">All Directions</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>

            <select
              value={filterTimeframe}
              onChange={handleFilterChange(setFilterTimeframe)}
              className="bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition"
            >
              <option value="">All Timeframes</option>
              {['1m','5m','15m','1H','4H','Daily'].map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1E293B] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {[
                    { key: 'trade_date', label: 'Date' },
                    { key: 'pair', label: 'Pair' },
                    { key: 'direction', label: 'Direction' },
                    { key: 'session', label: 'Session' },
                    { key: 'timeframe', label: 'TF' },
                    { key: 'result', label: 'Result' },
                    { key: 'rr_achieved', label: 'RR' },
                    { key: 'pnl_amount', label: 'P&L' },
                    { key: null, label: 'Setup' },
                  ].map(({ key, label }) => (
                    <th
                      key={label}
                      onClick={() => key && handleSort(key)}
                      className={`text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider ${key ? 'cursor-pointer hover:text-white' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon col={key} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-500 py-16">Loading trades...</td>
                  </tr>
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-500 py-16">
                      No trades found. Start by adding your first trade.
                    </td>
                  </tr>
                ) : (
                  trades.map((trade) => (
                    <tr
                      key={trade.id}
                      onClick={() => navigate(`/trades/${trade.id}`)}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition"
                    >
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {new Date(trade.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-white">{trade.pair}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${DIRECTION_COLORS[trade.direction]}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{trade.session}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{trade.timeframe}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${RESULT_COLORS[trade.result]}`}>
                          {trade.result}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {trade.rr_achieved ? `${trade.rr_achieved}R` : '—'}
                      </td>
                      <td className={`px-5 py-4 text-sm font-semibold ${trade.pnl_amount >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                        {trade.pnl_amount != null ? `$${Number(trade.pnl_amount).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">{getSetup(trade)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} trades
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-400 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  )
}