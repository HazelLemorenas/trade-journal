import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

// --- Checkbox Config ---
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

const defaultCheckboxes = (items) =>
  Object.fromEntries(items.map(({ key }) => [key, false]))

const defaultPsych = () => ({
  confidence: 5,
  fear: 5,
  patience: 5,
  emotion: 'calm',
})

export default function NewTradePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // --- Form State ---
  const [trade, setTrade] = useState({
    trade_date: '',
    pair: '',
    direction: 'long',
    timeframe: '1H',
    session: 'London',
    status: 'closed',
    entry_time: '',
    exit_time: '',
    entry_price: '',
    stop_loss_price: '',
    take_profit_price: '',
    exit_price: '',
    risk_amount: '',
    risk_percentage: '',
    position_size: '',
    result: 'win',
    rr_planned: '',
    rr_achieved: '',
    pnl_amount: '',
    pnl_percentage: '',
    daily_bias: 'bullish',
    bias_reason: '',
    entry_reasoning: '',
    improvement_notes: '',
    additional_notes: '',
  })

  const [confluences, setConfluences] = useState({
    ...defaultCheckboxes(LIQUIDITY_ITEMS),
    ...defaultCheckboxes(MARKET_STRUCTURE_ITEMS),
    ...defaultCheckboxes(ENTRY_MODEL_ITEMS),
    ...defaultCheckboxes(CONFLUENCE_ITEMS),
  })

  const [mistakes, setMistakes] = useState(defaultCheckboxes(MISTAKE_ITEMS))

  const [beforePsych, setBeforePsych] = useState(defaultPsych())
  const [afterPsych, setAfterPsych] = useState(defaultPsych())

  const [screenshots, setScreenshots] = useState({
    before: null, during: null, after: null,
  })

  // --- Helpers ---
  const setField = (key, value) => setTrade((prev) => ({ ...prev, [key]: value }))

  const calcHoldDuration = () => {
    if (!trade.entry_time || !trade.exit_time) return null
    const diff = new Date(trade.exit_time) - new Date(trade.entry_time)
    return Math.round(diff / 60000)
  }

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const holdDuration = calcHoldDuration()

      // 1. Insert trade
      const { data: tradeData, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
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
          hold_duration_minutes: holdDuration,
        })
        .select()
        .single()

      if (tradeError) throw tradeError

      const tradeId = tradeData.id

      // 2. Insert confluences
      await supabase.from('trade_confluences').insert({
        trade_id: tradeId,
        user_id: user.id,
        ...confluences,
      })

      // 3. Insert psychology
      await supabase.from('trade_psychology').insert({
        trade_id: tradeId,
        user_id: user.id,
        before_confidence: beforePsych.confidence,
        before_fear: beforePsych.fear,
        before_patience: beforePsych.patience,
        before_emotion: beforePsych.emotion,
        after_confidence: afterPsych.confidence,
        after_fear: afterPsych.fear,
        after_patience: afterPsych.patience,
        after_emotion: afterPsych.emotion,
      })

      // 4. Insert mistakes
      await supabase.from('trade_mistakes').insert({
        trade_id: tradeId,
        user_id: user.id,
        ...mistakes,
      })

      navigate('/trades')
    } catch (err) {
      setError(err.message)
    }

    setSaving(false)
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">New Trade</h2>
          <p className="text-slate-400 text-sm mt-1">Record your trade in detail</p>
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
            </div>
          </SectionCard>

          {/* SECTION B: Prices */}
          <SectionCard title="Price Levels" subtitle="Entry, exit, and risk levels">
            <div className="grid grid-cols-3 gap-4">
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
              <FormField label="Risk Amount ($)">
                <Input type="number" step="any" placeholder="0.00" value={trade.risk_amount} onChange={(e) => setField('risk_amount', e.target.value)} />
              </FormField>
              <FormField label="Risk (%)">
                <Input type="number" step="any" placeholder="1.00" value={trade.risk_percentage} onChange={(e) => setField('risk_percentage', e.target.value)} />
              </FormField>
              <FormField label="Position Size">
                <Input type="number" step="any" placeholder="0.00" value={trade.position_size} onChange={(e) => setField('position_size', e.target.value)} />
              </FormField>
              <FormField label="RR Planned">
                <Input type="number" step="any" placeholder="2.00" value={trade.rr_planned} onChange={(e) => setField('rr_planned', e.target.value)} />
              </FormField>
              <FormField label="RR Achieved">
                <Input type="number" step="any" placeholder="0.00" value={trade.rr_achieved} onChange={(e) => setField('rr_achieved', e.target.value)} />
              </FormField>
              <FormField label="P&L Amount ($)">
                <Input type="number" step="any" placeholder="0.00" value={trade.pnl_amount} onChange={(e) => setField('pnl_amount', e.target.value)} />
              </FormField>
              <FormField label="P&L (%)">
                <Input type="number" step="any" placeholder="0.00" value={trade.pnl_percentage} onChange={(e) => setField('pnl_percentage', e.target.value)} />
              </FormField>
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
                  placeholder="Why did you have this bias today? What did you see on the higher timeframes?"
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
              placeholder="Price swept Asia low. Bullish CHoCH formed. Returned into bullish FVG. Entered at discount. Targeting previous day high."
              value={trade.entry_reasoning}
              onChange={(e) => setField('entry_reasoning', e.target.value)}
            />
          </SectionCard>

          {/* SECTION F: Screenshots */}
          <SectionCard title="Trade Screenshots" subtitle="Upload your chart screenshots">
            <div className="grid grid-cols-3 gap-4">
              {['before', 'during', 'after'].map((stage) => (
                <ScreenshotUploader
                  key={stage}
                  stage={stage}
                  tradeId={null}
                  onUpload={({ stage, file, preview }) => {
                    setScreenshots((prev) => ({ ...prev, [stage]: { file, preview } }))
                  }}
                />
              ))}
            </div>
          </SectionCard>

          {/* SECTION G: Psychology */}
          <SectionCard title="Psychology — Before Entry" subtitle="How were you feeling before entering?">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <Slider label="Confidence" value={beforePsych.confidence} onChange={(v) => setBeforePsych((p) => ({ ...p, confidence: v }))} />
                <Slider label="Fear" value={beforePsych.fear} onChange={(v) => setBeforePsych((p) => ({ ...p, fear: v }))} />
                <Slider label="Patience" value={beforePsych.patience} onChange={(v) => setBeforePsych((p) => ({ ...p, patience: v }))} />
              </div>
              <FormField label="Emotion">
                <div className="flex gap-2 flex-wrap">
                  {['calm','excited','nervous','fearful','overconfident'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setBeforePsych((p) => ({ ...p, emotion: em }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                        beforePsych.emotion === em
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
                <Slider label="Confidence" value={afterPsych.confidence} onChange={(v) => setAfterPsych((p) => ({ ...p, confidence: v }))} />
                <Slider label="Fear" value={afterPsych.fear} onChange={(v) => setAfterPsych((p) => ({ ...p, fear: v }))} />
                <Slider label="Patience" value={afterPsych.patience} onChange={(v) => setAfterPsych((p) => ({ ...p, patience: v }))} />
              </div>
              <FormField label="Emotion">
                <div className="flex gap-2 flex-wrap">
                  {['calm','excited','nervous','fearful','overconfident'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAfterPsych((p) => ({ ...p, emotion: em }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                        afterPsych.emotion === em
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
                  placeholder="Anything else worth noting about this trade..."
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
              onClick={() => navigate('/trades')}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold transition disabled:opacity-50"
            >
              {saving ? 'Saving Trade...' : 'Save Trade'}
            </button>
          </div>

        </form>
      </div>
    </MainLayout>
  )
}