import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import MainLayout from '../layouts/MainLayout'
import SectionCard from '../components/ui/SectionCard'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import CheckboxGroup from '../components/ui/CheckboxGroup'
import Slider from '../components/ui/Slider'
import ScreenshotUploader from '../components/ui/ScreenshotUploader'
import { uploadScreenshots } from '../lib/uploadScreenshots'
import { ArrowLeft } from 'lucide-react'

const LIQUIDITY_ITEMS = [
  { key: 'asia_high_sweep', label: 'Asia High Sweep' },
  { key: 'asia_low_sweep', label: 'Asia Low Sweep' },
  { key: 'london_high_sweep', label: 'London High Sweep' },
  { key: 'london_low_sweep', label: 'London Low Sweep' },
  { key: 'prev_day_high_sweep', label: 'Prev Day High' },
  { key: 'prev_day_low_sweep', label: 'Prev Day Low' },
  { key: 'weekly_high_sweep', label: 'Weekly High' },
  { key: 'weekly_low_sweep', label: 'Weekly Low' },
]

const MARKET_STRUCTURE_ITEMS = [
  { key: 'bos', label: 'BOS' },
  { key: 'choch', label: 'CHoCH' },
  { key: 'mss', label: 'MSS' },
]

const ENTRY_MODEL_ITEMS = [
  { key: 'fair_value_gap', label: 'Fair Value Gap' },
  { key: 'order_block', label: 'Order Block' },
  { key: 'breaker', label: 'Breaker' },
  { key: 'mitigation_block', label: 'Mitigation Block' },
  { key: 'inversion_fvg', label: 'Inversion FVG' },
  { key: 'liquidity_void', label: 'Liquidity Void' },
]

const CONFLUENCE_ITEMS = [
  { key: 'premium_zone', label: 'Premium Zone' },
  { key: 'discount_zone', label: 'Discount Zone' },
  { key: 'session_timing', label: 'Session Timing' },
  { key: 'htf_bias', label: 'HTF Bias' },
  { key: 'liquidity_grab', label: 'Liquidity Grab' },
  { key: 'smt_divergence', label: 'SMT Divergence' },
  { key: 'economic_event', label: 'Economic Event' },
]

const MISTAKE_ITEMS = [
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

const formatDateTimeLocal = (val) => {
  if (!val) return ''
  const d = new Date(val)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditTradePage() {
  const { id } = useParams()
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [strategies, setStrategies] = useState([])

  const [trade, setTrade] = useState(null)
  const [confluences, setConfluences] = useState(null)
  const [psychology, setPsychology] = useState(null)
  const [mistakes, setMistakes] = useState(null)
  const [existingScreenshots, setExistingScreenshots] = useState([])

  const [newScreenshots, setNewScreenshots] = useState({
    before: null, during: null, after: null,
  })
  const [newPreviews, setNewPreviews] = useState({
    before: null, during: null, after: null,
  })

  useEffect(() => {
    fetchAll()
    fetchStrategies()
  }, [id])

  const fetchStrategies = async () => {
    const { data } = await supabase
      .from('strategies')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name')
    setStrategies(data || [])
  }

  const fetchAll = async () => {
    setLoading(true)

    const [tradeRes, confRes, psychRes, mistakeRes, ssRes] = await Promise.all([
      supabase.from('trades').select('*').eq('id', id).single(),
      supabase.from('trade_confluences').select('*').eq('trade_id', id).single(),
      supabase.from('trade_psychology').select('*').eq('trade_id', id).single(),
      supabase.from('trade_mistakes').select('*').eq('trade_id', id).single(),
      supabase.from('trade_screenshots').select('*').eq('trade_id', id),
    ])

    if (tradeRes.data) {
      const t = tradeRes.data
      setTrade({
        trade_date: t.trade_date || '',
        pair: t.pair || '',
        direction: t.direction || 'long',
        timeframe: t.timeframe || '1H',
        session: t.session || 'London',
        status: t.status || 'closed',
        entry_time: formatDateTimeLocal(t.entry_time),
        exit_time: formatDateTimeLocal(t.exit_time),
        entry_price: t.entry_price || '',
        stop_loss_price: t.stop_loss_price || '',
        take_profit_price: t.take_profit_price || '',
        exit_price: t.exit_price || '',
        risk_amount: t.risk_amount || '',
        risk_percentage: t.risk_percentage || '',
        position_size: t.position_size || '',
        result: t.result || 'win',
        rr_planned: t.rr_planned || '',
        rr_achieved: t.rr_achieved || '',
        pnl_amount: t.pnl_amount || '',
        pnl_percentage: t.pnl_percentage || '',
        daily_bias: t.daily_bias || 'bullish',
        bias_reason: t.bias_reason || '',
        entry_reasoning: t.entry_reasoning || '',
        improvement_notes: t.improvement_notes || '',
        additional_notes: t.additional_notes || '',
        strategy_id: t.strategy_id || '',
      })
    }

    if (confRes.data) setConfluences(confRes.data)
    if (psychRes.data) {
      const p = psychRes.data
      setPsychology({
        before: {
          confidence: p.before_confidence || 5,
          fear: p.before_fear || 5,
          patience: p.before_patience || 5,
          emotion: p.before_emotion || 'calm',
        },
        after: {
          confidence: p.after_confidence || 5,
          fear: p.after_fear || 5,
          patience: p.after_patience || 5,
          emotion: p.after_emotion || 'calm',
        },
      })
    }
    if (mistakeRes.data) setMistakes(mistakeRes.data)
    setExistingScreenshots(ssRes.data || [])

    setLoading(false)
  }

  const setField = (key, value) => {
    setTrade((prev) => {
      const updated = { ...prev, [key]: value }

      const entry = parseFloat(updated.entry_price)
      const sl = parseFloat(updated.stop_loss_price)
      const tp = parseFloat(updated.take_profit_price)
      const exit = parseFloat(updated.exit_price)
      const size = parseFloat(updated.position_size)
      const balance = parseFloat(profile?.current_balance)
      const isShort = updated.direction === 'short'

      if (!isNaN(entry) && !isNaN(sl) && !isNaN(size)) {
        const riskAmount = Math.abs(entry - sl) * size
        updated.risk_amount = riskAmount.toFixed(2)
        if (!isNaN(balance) && balance > 0) {
          updated.risk_percentage = ((riskAmount / balance) * 100).toFixed(2)
        }
      }

      if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp)) {
        const riskPips = Math.abs(entry - sl)
        const rewardPips = Math.abs(tp - entry)
        if (riskPips > 0) updated.rr_planned = (rewardPips / riskPips).toFixed(2)
      }

      if (!isNaN(entry) && !isNaN(sl) && !isNaN(exit) && !isNaN(size)) {
        const riskPips = Math.abs(entry - sl)
        if (riskPips > 0) {
          updated.rr_achieved = (Math.abs(exit - entry) / riskPips).toFixed(2)
        }
        const pnl = isShort ? (entry - exit) * size : (exit - entry) * size
        updated.pnl_amount = pnl.toFixed(2)
        if (!isNaN(balance) && balance > 0) {
          updated.pnl_percentage = ((pnl / balance) * 100).toFixed(2)
        }
      }

      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const holdDuration = (() => {
        if (!trade.entry_time || !trade.exit_time) return null
        return Math.round((new Date(trade.exit_time) - new Date(trade.entry_time)) / 60000)
      })()

      // Update trade
      await supabase.from('trades').update({
        ...trade,
        entry_price: trade.entry_price || null,
        stop_loss_price: trade.stop_loss_price || null,
        take_profit_price: trade.take_profit_price || null,
        exit_price: trade.exit_price || null,
        risk_amount: trade.risk_amount || null,
        risk_percentage: trade.risk_percentage || null,
        position_size: trade.position_size || null,
        rr_planned: trade.rr_planned || null,
        rr_achieved: trade.rr_achieved || null,
        pnl_amount: trade.pnl_amount || null,
        pnl_percentage: trade.pnl_percentage || null,
        strategy_id: trade.strategy_id || null,
        hold_duration_minutes: holdDuration,
        updated_at: new Date().toISOString(),
      }).eq('id', id)

      // Update confluences
      await supabase.from('trade_confluences')
        .update(confluences)
        .eq('trade_id', id)

      // Update psychology
      await supabase.from('trade_psychology').update({
        before_confidence: psychology.before.confidence,
        before_fear: psychology.before.fear,
        before_patience: psychology.before.patience,
        before_emotion: psychology.before.emotion,
        after_confidence: psychology.after.confidence,
        after_fear: psychology.after.fear,
        after_patience: psychology.after.patience,
        after_emotion: psychology.after.emotion,
      }).eq('trade_id', id)

      // Update mistakes
      await supabase.from('trade_mistakes')
        .update(mistakes)
        .eq('trade_id', id)

      // Upload any new screenshots
      const hasNew = Object.values(newScreenshots).some(f => f !== null)
      if (hasNew) {
        await uploadScreenshots(id, user.id, newScreenshots)
      }

      navigate(`/trades/${id}`)
    } catch (err) {
      setError(err.message)
    }

    setSaving(false)
  }

  if (loading || !trade || !confluences || !psychology || !mistakes) return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading trade...</p>
      </div>
    </MainLayout>
  )

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/trades/${id}`)}
            className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Trade</h2>
            <p className="text-slate-400 text-sm mt-1">Update your trade details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION A: Trade Information */}
          <SectionCard title="Trade Information" subtitle="Basic details about this trade">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Date" required>
                <Input type="date" value={trade.trade_date} onChange={(e) => setField('trade_date', e.target.value)} required />
              </FormField>
              <FormField label="Trading Pair" required>
                <Input placeholder="BTC/USDT" value={trade.pair} onChange={(e) => setField('pair', e.target.value)} required />
              </FormField>
              <FormField label="Direction" required>
                <Select value={trade.direction} onChange={(e) => setField('direction', e.target.value)}>
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </Select>
              </FormField>
              <FormField label="Timeframe">
                <Select value={trade.timeframe} onChange={(e) => setField('timeframe', e.target.value)}>
                  {['1m','5m','15m','1H','4H','Daily'].map(tf => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Session">
                <Select value={trade.session} onChange={(e) => setField('session', e.target.value)}>
                  {['Asia','London','New York'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Status">
                <Select value={trade.status} onChange={(e) => setField('status', e.target.value)}>
                  <option value="closed">Closed</option>
                  <option value="open">Open</option>
                </Select>
              </FormField>
              <FormField label="Entry Time">
                <Input type="datetime-local" value={trade.entry_time} onChange={(e) => setField('entry_time', e.target.value)} />
              </FormField>
              <FormField label="Exit Time">
                <Input type="datetime-local" value={trade.exit_time} onChange={(e) => setField('exit_time', e.target.value)} />
              </FormField>
              <FormField label="Result">
                <Select value={trade.result} onChange={(e) => setField('result', e.target.value)}>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="breakeven">Break Even</option>
                </Select>
              </FormField>
              <FormField label="Strategy">
                <Select value={trade.strategy_id} onChange={(e) => setField('strategy_id', e.target.value)}>
                  <option value="">No Strategy</option>
                  {strategies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </SectionCard>

          {/* SECTION B: Price Levels */}
          <SectionCard title="Price Levels" subtitle="Enter your prices and size — everything else is calculated automatically">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <FormField label="Entry Price">
                <Input type="number" step="any" placeholder="0.00" value={trade.entry_price} onChange={(e) => setField('entry_price', e.target.value)} />
              </FormField>
              <FormField label="Stop Loss Price">
                <Input type="number" step="any" placeholder="0.00" value={trade.stop_loss_price} onChange={(e) => setField('stop_loss_price', e.target.value)} />
              </FormField>
              <FormField label="Take Profit Price">
                <Input type="number" step="any" placeholder="0.00" value={trade.take_profit_price} onChange={(e) => setField('take_profit_price', e.target.value)} />
              </FormField>
              <FormField label="Exit Price">
                <Input type="number" step="any" placeholder="0.00" value={trade.exit_price} onChange={(e) => setField('exit_price', e.target.value)} />
              </FormField>
              <FormField label="Position Size">
                <Input type="number" step="any" placeholder="0.00" value={trade.position_size} onChange={(e) => setField('position_size', e.target.value)} />
              </FormField>
            </div>
            <div className="border-t border-slate-700 pt-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Auto-Calculated</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Risk Amount ($)', value: trade.risk_amount },
                  { label: 'Risk (%)', value: trade.risk_percentage },
                  { label: 'RR Planned', value: trade.rr_planned },
                  { label: 'RR Achieved', value: trade.rr_achieved },
                  { label: 'P&L Amount ($)', value: trade.pnl_amount },
                  { label: 'P&L (%)', value: trade.pnl_percentage },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#0F172A] rounded-lg px-4 py-3 border border-slate-700">
                    <p className="text-slate-500 text-xs mb-1">{label}</p>
                    <p className={`text-sm font-semibold ${
                      value && parseFloat(value) < 0 ? 'text-[#EF4444]'
                      : value && parseFloat(value) > 0 ? 'text-[#22C55E]'
                      : 'text-slate-500'
                    }`}>
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* SECTION C: Bias */}
          <SectionCard title="Daily Bias" subtitle="Your market direction read for the day">
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Daily Bias">
                <div className="flex gap-3">
                  {['bullish','bearish','neutral'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setField('daily_bias', b)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition capitalize ${
                        trade.daily_bias === b
                          ? b === 'bullish' ? 'bg-[#22C55E] border-[#22C55E] text-white'
                          : b === 'bearish' ? 'bg-[#EF4444] border-[#EF4444] text-white'
                          : 'bg-slate-600 border-slate-600 text-white'
                          : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Reason for Bias">
                <Textarea
                  placeholder="Why did you have this bias today?"
                  value={trade.bias_reason}
                  onChange={(e) => setField('bias_reason', e.target.value)}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* SECTION D: Confluences */}
          <SectionCard title="Trade Confluences" subtitle="What factors supported this trade?">
            <div className="space-y-6">
              <CheckboxGroup label="Liquidity Events" items={LIQUIDITY_ITEMS} values={confluences} onChange={setConfluences} />
              <CheckboxGroup label="Market Structure" items={MARKET_STRUCTURE_ITEMS} values={confluences} onChange={setConfluences} />
              <CheckboxGroup label="Entry Models" items={ENTRY_MODEL_ITEMS} values={confluences} onChange={setConfluences} />
              <CheckboxGroup label="Confluences" items={CONFLUENCE_ITEMS} values={confluences} onChange={setConfluences} />
            </div>
          </SectionCard>

          {/* SECTION E: Entry Reasoning */}
          <SectionCard title="Entry Reasoning" subtitle="Why did you take this trade?">
            <Textarea
              rows={5}
              placeholder="Price swept Asia low. Bullish CHoCH formed..."
              value={trade.entry_reasoning}
              onChange={(e) => setField('entry_reasoning', e.target.value)}
            />
          </SectionCard>

          {/* SECTION F: Screenshots */}
          <SectionCard title="Trade Screenshots" subtitle="Existing screenshots are preserved. Upload new ones to replace or add.">
            <div className="grid grid-cols-3 gap-4">
              {['before', 'during', 'after'].map((stage) => {
                const existing = existingScreenshots.find(s => s.stage === stage)
                return (
                  <ScreenshotUploader
                    key={stage}
                    stage={stage}
                    previewUrl={newPreviews[stage] || existing?.public_url || null}
                    onFileSelect={(stage, file) => {
                      setNewScreenshots(prev => ({ ...prev, [stage]: file }))
                      setNewPreviews(prev => ({
                        ...prev,
                        [stage]: file ? URL.createObjectURL(file) : null,
                      }))
                    }}
                  />
                )
              })}
            </div>
          </SectionCard>

          {/* SECTION G: Psychology */}
          <SectionCard title="Psychology — Before Entry" subtitle="How were you feeling before entering?">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <Slider label="Confidence" value={psychology.before.confidence} onChange={(v) => setPsychology(p => ({ ...p, before: { ...p.before, confidence: v } }))} />
                <Slider label="Fear" value={psychology.before.fear} onChange={(v) => setPsychology(p => ({ ...p, before: { ...p.before, fear: v } }))} />
                <Slider label="Patience" value={psychology.before.patience} onChange={(v) => setPsychology(p => ({ ...p, before: { ...p.before, patience: v } }))} />
              </div>
              <FormField label="Emotion">
                <div className="flex gap-2 flex-wrap">
                  {['calm','excited','nervous','fearful','overconfident'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setPsychology(p => ({ ...p, before: { ...p.before, emotion: em } }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                        psychology.before.emotion === em
                          ? 'bg-[#22C55E] border-[#22C55E] text-white'
                          : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Psychology — After Trade" subtitle="How did you feel after the trade closed?">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <Slider label="Confidence" value={psychology.after.confidence} onChange={(v) => setPsychology(p => ({ ...p, after: { ...p.after, confidence: v } }))} />
                <Slider label="Fear" value={psychology.after.fear} onChange={(v) => setPsychology(p => ({ ...p, after: { ...p.after, fear: v } }))} />
                <Slider label="Patience" value={psychology.after.patience} onChange={(v) => setPsychology(p => ({ ...p, after: { ...p.after, patience: v } }))} />
              </div>
              <FormField label="Emotion">
                <div className="flex gap-2 flex-wrap">
                  {['calm','excited','nervous','fearful','overconfident'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setPsychology(p => ({ ...p, after: { ...p.after, emotion: em } }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                        psychology.after.emotion === em
                          ? 'bg-[#22C55E] border-[#22C55E] text-white'
                          : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </SectionCard>

          {/* SECTION H: Mistakes */}
          <SectionCard title="Mistakes & Violations" subtitle="Be honest — what went wrong?">
            <CheckboxGroup items={MISTAKE_ITEMS} values={mistakes} onChange={setMistakes} />
          </SectionCard>

          {/* SECTION I: Notes */}
          <SectionCard title="Post Trade Notes" subtitle="What can you improve or repeat next time?">
            <div className="space-y-4">
              <FormField label="Improvement Notes">
                <Textarea
                  rows={4}
                  placeholder="What can you improve or repeat next time?"
                  value={trade.improvement_notes}
                  onChange={(e) => setField('improvement_notes', e.target.value)}
                />
              </FormField>
              <FormField label="Additional Notes">
                <Textarea
                  rows={3}
                  placeholder="Anything else worth noting..."
                  value={trade.additional_notes}
                  onChange={(e) => setField('additional_notes', e.target.value)}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Error */}
          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-xl p-4">
              <p className="text-[#EF4444] text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pb-8">
            <button
              type="button"
              onClick={() => navigate(`/trades/${id}`)}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Trade'}
            </button>
          </div>

        </form>
      </div>
    </MainLayout>
  )
}