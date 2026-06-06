import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MainLayout from '../layouts/MainLayout'
import { ArrowLeft, ZoomIn, X } from 'lucide-react'

const RESULT_COLORS = {
  win: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
  loss: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
  breakeven: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
}

const DIRECTION_COLORS = {
  long: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
  short: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white font-medium">{value ?? '—'}</p>
    </div>
  )
}

function SectionBlock({ title, children }) {
  return (
    <div className="bg-[#1E293B] rounded-2xl p-6">
      <h3 className="text-white font-semibold text-base mb-5">{title}</h3>
      {children}
    </div>
  )
}

function CheckBadge({ label, active }) {
  return (
    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
      active
        ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
        : 'bg-slate-800 border-slate-700 text-slate-600'
    }`}>
      {label}
    </span>
  )
}

export default function TradeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [trade, setTrade] = useState(null)
  const [confluences, setConfluences] = useState(null)
  const [psychology, setPsychology] = useState(null)
  const [mistakes, setMistakes] = useState(null)
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoomedImg, setZoomedImg] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      const [tradeRes, confRes, psychRes, mistakeRes, ssRes] = await Promise.all([
        supabase.from('trades').select('*').eq('id', id).single(),
        supabase.from('trade_confluences').select('*').eq('trade_id', id).single(),
        supabase.from('trade_psychology').select('*').eq('trade_id', id).single(),
        supabase.from('trade_mistakes').select('*').eq('trade_id', id).single(),
        supabase.from('trade_screenshots').select('*').eq('trade_id', id),
      ])

      setTrade(tradeRes.data)
      setConfluences(confRes.data)
      setPsychology(psychRes.data)
      setMistakes(mistakeRes.data)
      setScreenshots(ssRes.data || [])
      setLoading(false)
    }

    fetchAll()
  }, [id])

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading trade...</p>
      </div>
    </MainLayout>
  )

  if (!trade) return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Trade not found.</p>
      </div>
    </MainLayout>
  )

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/trades')}
            className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{trade.pair}</h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg border capitalize ${DIRECTION_COLORS[trade.direction]}`}>
                {trade.direction}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg border capitalize ${RESULT_COLORS[trade.result]}`}>
                {trade.result}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{formatDate(trade.trade_date)} · {trade.session} Session · {trade.timeframe}</p>
          </div>
          <button
            onClick={() => navigate(`/trades/${id}/edit`)}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition"
          >
            Edit Trade
          </button>
        </div>

        <div className="space-y-6">

          {/* Trade Info */}
          <SectionBlock title="Trade Information">
            <div className="grid grid-cols-4 gap-6">
              <DetailRow label="Date" value={formatDate(trade.trade_date)} />
              <DetailRow label="Entry Time" value={formatTime(trade.entry_time)} />
              <DetailRow label="Exit Time" value={formatTime(trade.exit_time)} />
              <DetailRow label="Hold Duration" value={trade.hold_duration_minutes ? `${trade.hold_duration_minutes}m` : '—'} />
              <DetailRow label="Entry Price" value={trade.entry_price} />
              <DetailRow label="Stop Loss" value={trade.stop_loss_price} />
              <DetailRow label="Take Profit" value={trade.take_profit_price} />
              <DetailRow label="Exit Price" value={trade.exit_price} />
              <DetailRow label="Risk Amount" value={trade.risk_amount ? `$${trade.risk_amount}` : '—'} />
              <DetailRow label="Risk %" value={trade.risk_percentage ? `${trade.risk_percentage}%` : '—'} />
              <DetailRow label="Position Size" value={trade.position_size} />
              <DetailRow label="RR Planned" value={trade.rr_planned ? `${trade.rr_planned}R` : '—'} />
              <DetailRow label="RR Achieved" value={trade.rr_achieved ? `${trade.rr_achieved}R` : '—'} />
              <DetailRow label="P&L Amount" value={trade.pnl_amount ? `$${trade.pnl_amount}` : '—'} />
              <DetailRow label="P&L %" value={trade.pnl_percentage ? `${trade.pnl_percentage}%` : '—'} />
            </div>
          </SectionBlock>

          {/* Bias */}
          <SectionBlock title="Daily Bias">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border capitalize ${
                trade.daily_bias === 'bullish' ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20'
                : trade.daily_bias === 'bearish' ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20'
                : 'text-slate-400 bg-slate-800 border-slate-700'
              }`}>
                {trade.daily_bias}
              </span>
            </div>
            {trade.bias_reason && <p className="text-slate-300 text-sm leading-relaxed">{trade.bias_reason}</p>}
          </SectionBlock>

          {/* Confluences */}
          {confluences && (
            <SectionBlock title="Trade Confluences">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Liquidity Events</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'asia_high_sweep', label: 'Asia High Sweep' },
                      { key: 'asia_low_sweep', label: 'Asia Low Sweep' },
                      { key: 'london_high_sweep', label: 'London High Sweep' },
                      { key: 'london_low_sweep', label: 'London Low Sweep' },
                      { key: 'prev_day_high_sweep', label: 'Prev Day High' },
                      { key: 'prev_day_low_sweep', label: 'Prev Day Low' },
                      { key: 'weekly_high_sweep', label: 'Weekly High' },
                      { key: 'weekly_low_sweep', label: 'Weekly Low' },
                    ].map(({ key, label }) => (
                      <CheckBadge key={key} label={label} active={confluences[key]} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Market Structure</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'bos', label: 'BOS' },
                      { key: 'choch', label: 'CHoCH' },
                      { key: 'mss', label: 'MSS' },
                    ].map(({ key, label }) => (
                      <CheckBadge key={key} label={label} active={confluences[key]} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Entry Models</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'fair_value_gap', label: 'Fair Value Gap' },
                      { key: 'order_block', label: 'Order Block' },
                      { key: 'breaker', label: 'Breaker' },
                      { key: 'mitigation_block', label: 'Mitigation Block' },
                      { key: 'inversion_fvg', label: 'Inversion FVG' },
                      { key: 'liquidity_void', label: 'Liquidity Void' },
                    ].map(({ key, label }) => (
                      <CheckBadge key={key} label={label} active={confluences[key]} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Confluences</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'premium_zone', label: 'Premium Zone' },
                      { key: 'discount_zone', label: 'Discount Zone' },
                      { key: 'session_timing', label: 'Session Timing' },
                      { key: 'htf_bias', label: 'HTF Bias' },
                      { key: 'liquidity_grab', label: 'Liquidity Grab' },
                      { key: 'smt_divergence', label: 'SMT Divergence' },
                      { key: 'economic_event', label: 'Economic Event' },
                    ].map(({ key, label }) => (
                      <CheckBadge key={key} label={label} active={confluences[key]} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionBlock>
          )}

          {/* Entry Reasoning */}
          {trade.entry_reasoning && (
            <SectionBlock title="Entry Reasoning">
              <p className="text-slate-300 text-sm leading-relaxed">{trade.entry_reasoning}</p>
            </SectionBlock>
          )}

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <SectionBlock title="Trade Screenshots">
              <div className="grid grid-cols-3 gap-4">
                {['before', 'during', 'after'].map((stage) => {
                  const ss = screenshots.find(s => s.stage === stage)
                  return ss ? (
                    <div key={stage} className="relative group rounded-xl overflow-hidden border border-slate-700">
                      <p className="text-xs text-slate-500 uppercase tracking-wider px-3 pt-3 pb-2 capitalize">{stage}</p>
                      <img src={ss.public_url} alt={stage} className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          onClick={() => setZoomedImg(ss.public_url)}
                          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg"
                        >
                          <ZoomIn size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={stage} className="rounded-xl border border-slate-700 h-48 flex items-center justify-center">
                      <p className="text-slate-600 text-xs capitalize">{stage} — No screenshot</p>
                    </div>
                  )
                })}
              </div>
            </SectionBlock>
          )}

          {/* Psychology */}
          {psychology && (
            <SectionBlock title="Psychology">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Before Entry</p>
                  <div className="space-y-2">
                    <DetailRow label="Confidence" value={`${psychology.before_confidence}/10`} />
                    <DetailRow label="Fear" value={`${psychology.before_fear}/10`} />
                    <DetailRow label="Patience" value={`${psychology.before_patience}/10`} />
                    <DetailRow label="Emotion" value={psychology.before_emotion} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">After Trade</p>
                  <div className="space-y-2">
                    <DetailRow label="Confidence" value={`${psychology.after_confidence}/10`} />
                    <DetailRow label="Fear" value={`${psychology.after_fear}/10`} />
                    <DetailRow label="Patience" value={`${psychology.after_patience}/10`} />
                    <DetailRow label="Emotion" value={psychology.after_emotion} />
                  </div>
                </div>
              </div>
            </SectionBlock>
          )}

          {/* Mistakes */}
          {mistakes && (
            <SectionBlock title="Mistakes & Violations">
              <div className="flex flex-wrap gap-2">
                {[
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
                ].map(({ key, label }) => (
                  <CheckBadge key={key} label={label} active={mistakes[key]} />
                ))}
              </div>
            </SectionBlock>
          )}

          {/* Notes */}
          {(trade.improvement_notes || trade.additional_notes) && (
            <SectionBlock title="Post Trade Notes">
              {trade.improvement_notes && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Improvement Notes</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{trade.improvement_notes}</p>
                </div>
              )}
              {trade.additional_notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Additional Notes</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{trade.additional_notes}</p>
                </div>
              )}
            </SectionBlock>
          )}

        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomedImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg"
            onClick={() => setZoomedImg(null)}
          >
            <X size={20} />
          </button>
          <img
            src={zoomedImg}
            alt="zoomed"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </MainLayout>
  )
}